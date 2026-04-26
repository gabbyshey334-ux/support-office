/**
 * One-time admin seeder.
 *
 * Usage:
 *   npx ts-node scripts/create-admin.ts
 *   # or
 *   npm run create-admin
 *
 * Required environment variables (read from .env.local automatically):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Optional environment variables (otherwise read from CLI flags or prompts):
 *   ADMIN_EMAIL       e.g. admin@supportoffice.ng
 *   ADMIN_PASSWORD    e.g. SuperSecret#2026
 *   ADMIN_FULL_NAME   e.g. "Amara Okafor"
 *   ADMIN_USERNAME    e.g. amara.okafor    (defaults to slug of full name)
 *   ADMIN_PHONE       e.g. +2348011110001
 *   ADMIN_TEAM        e.g. "Support Office"
 *
 * CLI flag fallbacks:
 *   --email --password --name --username --phone --team
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const raw of fs.readFileSync(envPath, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim().replace(/^"|"$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseFlags(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value =
        argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : "true";
      out[key] = value;
      if (value !== "true") i += 1;
    }
  }
  return out;
}

function prompt(question: string, secret = false): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    if (secret) {
      // Best-effort masking of the input echo.
      const stdout = process.stdout as NodeJS.WriteStream & {
        clearLine?: (dir: number) => void;
        cursorTo?: (col: number) => void;
      };
      const originalWrite = stdout.write.bind(stdout);
      (stdout.write as unknown) = (chunk: string) => {
        if (chunk && chunk !== `${question}` && chunk !== "\n") {
          return originalWrite("*");
        }
        return originalWrite(chunk);
      };
      rl.question(question, (answer) => {
        stdout.write = originalWrite;
        rl.close();
        process.stdout.write("\n");
        resolve(answer);
      });
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

async function resolveValue(
  flagValue: string | undefined,
  envValue: string | undefined,
  question: string,
  secret = false
): Promise<string> {
  if (flagValue && flagValue !== "true") return flagValue;
  if (envValue) return envValue;
  return prompt(question, secret);
}

async function main() {
  loadDotEnv();
  const flags = parseFlags(process.argv.slice(2));

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.error(
      "❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n    Add them to .env.local and try again."
    );
    process.exit(1);
  }

  const fullName = await resolveValue(
    flags.name,
    process.env.ADMIN_FULL_NAME,
    "Full name: "
  );
  const email = await resolveValue(
    flags.email,
    process.env.ADMIN_EMAIL,
    "Email: "
  );
  const password = await resolveValue(
    flags.password,
    process.env.ADMIN_PASSWORD,
    "Password: ",
    true
  );
  const username =
    (await resolveValue(
      flags.username,
      process.env.ADMIN_USERNAME,
      `Username [${slugify(fullName)}]: `
    )) || slugify(fullName);
  const phone = await resolveValue(
    flags.phone,
    process.env.ADMIN_PHONE,
    "WhatsApp phone (+234…, optional): "
  );
  const team = await resolveValue(
    flags.team,
    process.env.ADMIN_TEAM,
    'Team [Support Office]: '
  );

  if (!fullName || !email || !password) {
    console.error("❌  Full name, email and password are all required.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("❌  Password must be at least 8 characters.");
    process.exit(1);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`\nCreating admin: ${fullName} <${email}> …`);

  // Reuse an existing auth user with the same email if present.
  let userId: string | undefined;
  const { data: list } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  const existing = list?.users.find((u) => u.email === email);

  if (existing) {
    userId = existing.id;
    await admin.auth.admin.updateUserById(userId, { password });
    console.log(`↺  Auth user already exists, password updated. id=${userId}`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, username },
    });
    if (error || !data.user) {
      console.error(`❌  Could not create auth user: ${error?.message}`);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`✓  Auth user created. id=${userId}`);
  }

  const { error: profileErr } = await admin.from("profiles").upsert({
    id: userId,
    full_name: fullName,
    username,
    phone_whatsapp: phone || null,
    role: "admin",
    team: team || "Support Office",
    is_active: true,
  });
  if (profileErr) {
    console.error(`❌  Could not upsert profile: ${profileErr.message}`);
    process.exit(1);
  }

  console.log("✓  Profile inserted with role=admin");
  console.log("\nCreated user ID:", userId);
  console.log(`\nLogin at /login with:\n  email:    ${email}\n  password: ${"*".repeat(password.length)}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
