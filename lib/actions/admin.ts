"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  adminAddMemberSchema,
  type AdminAddMemberValues,
} from "@/lib/validations";
import { formatDateISO } from "@/lib/utils";

async function ensureAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") {
    throw new Error("Forbidden");
  }
  return user.id;
}

export async function approveMemberAction(memberId: string) {
  await ensureAdmin();
  const admin = createServiceRoleClient();

  const { data: profile, error } = await admin
    .from("profiles")
    .update({ account_status: "approved", updated_at: new Date().toISOString() })
    .eq("id", memberId)
    .select("full_name")
    .single();

  if (error || !profile) {
    return { ok: false as const, error: error?.message ?? "Failed" };
  }

  await admin.from("notifications").insert({
    type: "approval",
    recipient_id: memberId,
    message: `Approved ${profile.full_name}`,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/approvals");
  revalidatePath("/admin/members");
  return { ok: true as const };
}

export async function rejectMemberAction(memberId: string) {
  await ensureAdmin();
  const admin = createServiceRoleClient();

  const { data: profile, error } = await admin
    .from("profiles")
    .update({ account_status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", memberId)
    .select("full_name")
    .single();

  if (error || !profile) {
    return { ok: false as const, error: error?.message ?? "Failed" };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/approvals");
  revalidatePath("/admin/members");
  return { ok: true as const };
}

export async function deleteMemberAction(memberId: string) {
  await ensureAdmin();
  const admin = createServiceRoleClient();
  const { error } = await admin.auth.admin.deleteUser(memberId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/members");
  return { ok: true as const };
}

export async function addMemberAction(values: AdminAddMemberValues) {
  await ensureAdmin();
  const parsed = adminAddMemberSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.errors[0]?.message ?? "Invalid input",
    };
  }

  const admin = createServiceRoleClient();
  const { data: created, error: createErr } = await admin.auth.admin.createUser(
    {
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
    }
  );
  if (createErr || !created.user) {
    return { ok: false as const, error: createErr?.message ?? "Failed" };
  }

  const { error: insertErr } = await admin.from("profiles").insert({
    id: created.user.id,
    full_name: parsed.data.full_name,
    sponsor_name: parsed.data.sponsor_name,
    upline_name: parsed.data.upline_name,
    phone: parsed.data.phone,
    date_of_birth: parsed.data.date_of_birth,
    status: parsed.data.status,
    team: parsed.data.team,
    role: "member",
    account_status: "approved",
  });

  if (insertErr) {
    return { ok: false as const, error: insertErr.message };
  }

  revalidatePath("/admin/members");
  return { ok: true as const };
}

export async function updateMemberAction(
  memberId: string,
  values: Partial<{
    full_name: string;
    phone: string;
    sponsor_name: string;
    upline_name: string;
    team: string;
    status: string;
    account_status: "pending" | "approved" | "rejected";
  }>
) {
  await ensureAdmin();
  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("profiles")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", memberId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/members");
  return { ok: true as const };
}

export async function adminMarkPresentAction(memberId: string) {
  const adminId = await ensureAdmin();
  const supabase = createClient();
  const today = formatDateISO(new Date());

  const { error } = await supabase.from("attendance").upsert(
    {
      user_id: memberId,
      date: today,
      checked_in_at: new Date().toISOString(),
      method: "admin",
      marked_by: adminId,
    },
    { onConflict: "user_id,date" }
  );

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/attendance");
  revalidatePath("/admin");
  return { ok: true as const };
}
