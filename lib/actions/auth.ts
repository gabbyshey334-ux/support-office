"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { fullRegisterSchema, setupSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import type { MemberStatus } from "@/types";

export async function registerAction(formData: {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  date_of_birth: string;
  phone_whatsapp: string;
  sponsor_name: string;
  upline_name: string;
  team?: string;
  status: MemberStatus;
  confirm_accuracy: true;
}) {
  const parsed = fullRegisterSchema.safeParse(formData);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const admin = createServiceRoleClient();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.full_name },
  });

  if (createErr || !created.user) {
    const msg = createErr?.message ?? "Could not create account";
    const lower = msg.toLowerCase();
    if (
      lower.includes("already") ||
      lower.includes("registered") ||
      lower.includes("duplicate")
    ) {
      return {
        ok: false as const,
        error:
          "An account with this email already exists. Go to Sign in and use the same email and password.",
      };
    }
    return { ok: false as const, error: msg };
  }

  const userId = created.user.id;

  const { error: profileError } = await admin.from("profiles").insert({
    id: userId,
    full_name: parsed.data.full_name,
    sponsor_name: parsed.data.sponsor_name,
    upline_name: parsed.data.upline_name,
    phone_whatsapp: parsed.data.phone_whatsapp,
    date_of_birth: parsed.data.date_of_birth,
    status: parsed.data.status,
    team: parsed.data.team || "Support Office",
    role: "member",
    account_status: "pending",
  });

  if (profileError) {
    return { ok: false as const, error: profileError.message };
  }

  return { ok: true as const };
}

export async function setupAction(values: unknown) {
  const parsed = setupSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  if (parsed.data.setup_key !== process.env.SETUP_SECRET_KEY) {
    return { ok: false as const, error: "Invalid setup key" };
  }

  const admin = createServiceRoleClient();

  const { count } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  if ((count ?? 0) > 0) {
    return { ok: false as const, error: "An admin already exists" };
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });
  if (createErr || !created.user) {
    return { ok: false as const, error: createErr?.message ?? "Could not create user" };
  }

  const { error: insertErr } = await admin.from("profiles").insert({
    id: created.user.id,
    full_name: parsed.data.full_name,
    sponsor_name: "Founder",
    upline_name: "Founder",
    phone_whatsapp: "+2348000000000",
    date_of_birth: "1990-01-01",
    status: "manager",
    team: "Support Office",
    role: "admin",
    account_status: "approved",
  });

  if (insertErr) {
    return { ok: false as const, error: insertErr.message };
  }

  return { ok: true as const };
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
