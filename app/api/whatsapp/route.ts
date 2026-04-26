import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, listProfiles } from "@/lib/queries/profiles";
import { getTodayAttendance } from "@/lib/queries/attendance";
import { buildDailySummary, buildPersonalCheckIn } from "@/lib/whatsapp";
import { sendWhatsAppMessage } from "./_send";
import { parseISO } from "date-fns";

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
  const type = body.type as "summary" | "personal" | undefined;

  try {
    if (type === "summary") {
      return await sendSummary(supabase);
    }
    if (type === "personal") {
      return await sendPersonalConfirmation(supabase, body.user_id as string);
    }
    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function sendSummary(supabase: ReturnType<typeof createClient>) {
  const [profiles, attendance] = await Promise.all([
    listProfiles(supabase, { activeOnly: true }),
    getTodayAttendance(supabase),
  ]);

  const presentIds = new Set(attendance.map((a) => a.user_id));
  const presentProfiles = profiles.filter((p) => presentIds.has(p.id));
  const absentProfiles = profiles.filter((p) => !presentIds.has(p.id));

  const recipients = profiles.filter(
    (p) => p.phone_whatsapp && (p.role === "admin" || p.role === "leader")
  );

  let delivered = 0;
  const errors: string[] = [];
  for (const recipient of recipients) {
    const message = buildDailySummary({
      recipientName: recipient.full_name,
      date: new Date(),
      totalMembers: profiles.length,
      presentCount: presentProfiles.length,
      absentCount: absentProfiles.length,
      presentNames: presentProfiles.map((p) => p.full_name),
      absentNames: absentProfiles.map((p) => p.full_name),
    });
    try {
      await sendWhatsAppMessage(recipient.phone_whatsapp!, message);
      delivered += 1;
    } catch (err) {
      const m = err instanceof Error ? err.message : "send failed";
      errors.push(`${recipient.full_name}: ${m}`);
    }
  }

  return NextResponse.json({
    delivered,
    attempted: recipients.length,
    errors,
  });
}

async function sendPersonalConfirmation(
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
  if (!userId) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  if (!profile.phone_whatsapp) {
    return NextResponse.json({ error: "No WhatsApp number" }, { status: 400 });
  }

  const { data: row } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", userId)
    .order("checked_in_at", { ascending: false })
    .limit(1)
    .single();
  if (!row) {
    return NextResponse.json({ error: "No attendance to confirm" }, { status: 404 });
  }

  const message = buildPersonalCheckIn({
    fullName: profile.full_name,
    checkedInAt: parseISO(row.checked_in_at),
  });
  await sendWhatsAppMessage(profile.phone_whatsapp, message);
  return NextResponse.json({ delivered: 1 });
}
