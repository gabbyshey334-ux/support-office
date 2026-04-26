"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";

const setupSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export interface SetupResult {
  ok: boolean;
  error?: string;
}

export interface AdminCheck {
  exists: boolean;
  configured: boolean;
  error?: string;
}

export async function checkAdminStatus(): Promise<AdminCheck> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (
    !url ||
    !key ||
    url.includes("your-project.supabase.co") ||
    key.includes("your-service-role-key")
  ) {
    return {
      exists: false,
      configured: false,
      error:
        "Supabase environment variables are not set. Configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    };
  }
  try {
    const admin = createAdminClient();
    const { count, error } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (error) {
      return { exists: false, configured: true, error: error.message };
    }
    return { exists: (count ?? 0) > 0, configured: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      exists: false,
      configured: false,
      error: `Could not reach Supabase: ${message}`,
    };
  }
}

export async function createFirstAdmin(
  _prev: SetupResult,
  formData: FormData
): Promise<SetupResult> {
  const parsed = setupSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  // Re-check on the server so this can never run twice.
  const status = await checkAdminStatus();
  if (!status.configured) {
    return { ok: false, error: status.error ?? "Supabase not configured." };
  }
  if (status.exists) {
    redirect("/login");
  }

  const { full_name, email, password } = parsed.data;
  const username = full_name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");

  const admin = createAdminClient();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, username },
  });
  if (createErr || !created.user) {
    return {
      ok: false,
      error: createErr?.message ?? "Could not create auth user.",
    };
  }

  const { error: profileErr } = await admin.from("profiles").insert({
    id: created.user.id,
    full_name,
    username,
    role: "admin",
    team: "Support Office",
    is_active: true,
  });
  if (profileErr) {
    await admin.auth.admin.deleteUser(created.user.id).catch(() => {});
    return { ok: false, error: profileErr.message };
  }

  redirect("/login?setup=ok");
}
