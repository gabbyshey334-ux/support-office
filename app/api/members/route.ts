import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/queries/profiles";
import {
  memberCreateSchema,
  passwordResetSchema,
} from "@/lib/validations";

export async function POST(request: Request) {
  const supabase = createClient();
  const me = await getCurrentProfile(supabase);
  if (!me) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (me.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = memberCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const values = parsed.data;

  const admin = createAdminClient();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: values.email,
    password: values.password,
    email_confirm: true,
    user_metadata: { full_name: values.full_name, username: values.username },
  });
  if (createErr || !created.user) {
    return NextResponse.json(
      { error: createErr?.message ?? "Could not create user" },
      { status: 400 }
    );
  }

  const { data: profile, error: profileErr } = await admin
    .from("profiles")
    .insert({
      id: created.user.id,
      full_name: values.full_name,
      username: values.username,
      phone_whatsapp: values.phone_whatsapp || null,
      role: values.role,
      team: values.team,
      is_active: true,
    })
    .select()
    .single();

  if (profileErr) {
    // Roll back the auth user if profile insert failed.
    await admin.auth.admin.deleteUser(created.user.id).catch(() => {});
    return NextResponse.json({ error: profileErr.message }, { status: 400 });
  }

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  const me = await getCurrentProfile(supabase);
  if (!me) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (me.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const id = body.id as string | undefined;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const parsed = passwordResetSchema.safeParse({ password: body.password });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid password" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, {
    password: parsed.data.password,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
