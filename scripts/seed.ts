/**
 * Seed Support Office demo data.
 *
 * Usage:
 *   1. Copy `.env.local.example` -> `.env.local` and fill in Supabase keys.
 *   2. Run: `npm run seed`
 *
 * The script uses the service role key, so NEVER expose it on the client.
 */

import { createClient } from "@supabase/supabase-js";
import { addDays, format } from "date-fns";
import * as fs from "node:fs";
import * as path from "node:path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsIdx = trimmed.indexOf("=");
    if (equalsIdx === -1) continue;
    const key = trimmed.slice(0, equalsIdx).trim();
    const value = trimmed.slice(equalsIdx + 1).trim().replace(/^"|"$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface SeedUser {
  email: string;
  password: string;
  full_name: string;
  username: string;
  phone_whatsapp: string;
  role: "admin" | "leader" | "member";
  team: string;
  attendanceProbability: number;
}

const SEED_USERS: SeedUser[] = [
  {
    email: "admin@supportoffice.ng",
    password: "Admin@12345",
    full_name: "Amara Okafor",
    username: "amara.okafor",
    phone_whatsapp: "+2348011110001",
    role: "admin",
    team: "Support Office",
    attendanceProbability: 0.95,
  },
  {
    email: "blessing@supportoffice.ng",
    password: "Leader@12345",
    full_name: "Blessing Nwosu",
    username: "blessing.nwosu",
    phone_whatsapp: "+2348011110002",
    role: "leader",
    team: "Ignite Team",
    attendanceProbability: 0.9,
  },
  {
    email: "ngozi@supportoffice.ng",
    password: "Leader@12345",
    full_name: "Ngozi Obi",
    username: "ngozi.obi",
    phone_whatsapp: "+2348011110003",
    role: "leader",
    team: "9ty4our Team",
    attendanceProbability: 0.85,
  },
  {
    email: "tunde@supportoffice.ng",
    password: "Member@12345",
    full_name: "Tunde Adebayo",
    username: "tunde.adebayo",
    phone_whatsapp: "+2348011110004",
    role: "member",
    team: "Ignite Team",
    attendanceProbability: 0.8,
  },
  {
    email: "chinaza@supportoffice.ng",
    password: "Member@12345",
    full_name: "Chinaza Eze",
    username: "chinaza.eze",
    phone_whatsapp: "+2348011110005",
    role: "member",
    team: "Ignite Team",
    attendanceProbability: 0.55,
  },
  {
    email: "fatima@supportoffice.ng",
    password: "Member@12345",
    full_name: "Fatima Bello",
    username: "fatima.bello",
    phone_whatsapp: "+2348011110006",
    role: "member",
    team: "9ty4our Team",
    attendanceProbability: 0.7,
  },
  {
    email: "kelechi@supportoffice.ng",
    password: "Member@12345",
    full_name: "Kelechi Onyeka",
    username: "kelechi.onyeka",
    phone_whatsapp: "+2348011110007",
    role: "member",
    team: "9ty4our Team",
    attendanceProbability: 0.4,
  },
];

async function ensureUser(user: SeedUser): Promise<string> {
  const { data: existingList } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  const existing = existingList?.users.find((u) => u.email === user.email);
  let userId = existing?.id;

  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        username: user.username,
      },
    });
    if (error || !data.user) {
      throw new Error(`Could not create ${user.email}: ${error?.message}`);
    }
    userId = data.user.id;
  } else {
    await admin.auth.admin.updateUserById(userId, { password: user.password });
  }

  await admin
    .from("profiles")
    .upsert({
      id: userId,
      full_name: user.full_name,
      username: user.username,
      phone_whatsapp: user.phone_whatsapp,
      role: user.role,
      team: user.team,
      is_active: true,
    });

  return userId;
}

async function seedAttendance(
  userId: string,
  probability: number
): Promise<number> {
  const today = new Date();
  const rows: {
    user_id: string;
    date: string;
    checked_in_at: string;
    method: "qr" | "manual" | "admin";
    marked_by: string;
  }[] = [];

  for (let offset = 13; offset >= 0; offset -= 1) {
    const day = addDays(today, -offset);
    const weekday = day.getDay();
    if (weekday === 0 || weekday === 6) continue;
    if (Math.random() > probability) continue;
    const hour = 8 + Math.floor(Math.random() * 2);
    const minute = Math.floor(Math.random() * 60);
    const checkedInAt = new Date(day);
    checkedInAt.setHours(hour, minute, 0, 0);
    rows.push({
      user_id: userId,
      date: format(day, "yyyy-MM-dd"),
      checked_in_at: checkedInAt.toISOString(),
      method: Math.random() < 0.85 ? "qr" : "admin",
      marked_by: userId,
    });
  }

  if (rows.length === 0) return 0;
  const { error } = await admin
    .from("attendance")
    .upsert(rows, { onConflict: "user_id,date" });
  if (error) {
    throw new Error(`attendance insert failed: ${error.message}`);
  }
  return rows.length;
}

async function main() {
  console.log("Seeding Support Office demo data…\n");

  for (const user of SEED_USERS) {
    process.stdout.write(`→ ${user.full_name} (${user.role}) `);
    const userId = await ensureUser(user);
    const inserted = await seedAttendance(userId, user.attendanceProbability);
    console.log(`✓ profile + ${inserted} attendance days`);
  }

  console.log("\nDone! Login credentials:");
  for (const user of SEED_USERS) {
    console.log(`  ${user.role.padEnd(7)} ${user.email}  ${user.password}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
