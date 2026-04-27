"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { fullRegisterSchema, setupSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

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
  status:
    | "distributor"
    | "senior_distributor"
    | "bronze"
    | "silver"
    | "gold"
    | "senior_gold"
    | "executive"
    | "ruby"
    | "emerald"
    | "diamond";
  confirm_accuracy: true;
}) {
  const parsed = fullRegisterSchema.safeParse(formData);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const supabase = createClient();

  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (signupError || !signupData.user) {
    return { ok: false as const, error: signupError?.message ?? "Signup failed" };
  }

  const userId = signupData.user.id;

  // Insert via service role to bypass RLS in case session not yet set
  const admin = createServiceRoleClient();
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

  // Sign user out — they should not be logged in until approved
  await supabase.auth.signOut();

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

  // Block if any admin already exists
  const { count } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  if ((count ?? 0) > 0) {
    return { ok: false as const, error: "An admin already exists" };
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser(
    {
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
    }
  );
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
    status: "diamond",
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
