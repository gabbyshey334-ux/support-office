import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { formatDateISO } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const scannedId = body?.scanned_user_id?.toString().trim();
  if (!scannedId) {
    return NextResponse.json({ error: "Missing scanned_user_id" }, { status: 400 });
  }

  // Only admins may record attendance via QR scan
  const { data: scanner } = await supabase
    .from("profiles")
    .select("role, account_status")
    .eq("id", user.id)
    .single();
  if (!scanner) {
    return NextResponse.json({ error: "Scanner profile not found" }, { status: 403 });
  }
  if (scanner.role !== "admin") {
    return NextResponse.json(
      {
        error:
          "Only administrators can record attendance. Members cannot scan or mark check-ins.",
      },
      { status: 403 }
    );
  }

  // Verify the scanned user exists and is approved
  const { data: target } = await supabase
    .from("profiles")
    .select("id, full_name, account_status")
    .eq("id", scannedId)
    .single();
  if (!target) {
    return NextResponse.json(
      { error: "Invalid QR code — user not found" },
      { status: 404 }
    );
  }
  if (target.account_status !== "approved") {
    return NextResponse.json(
      { error: "User account is not approved" },
      { status: 403 }
    );
  }

  const today = formatDateISO(new Date());
  const { data: existing } = await supabase
    .from("attendance")
    .select("id, checked_in_at")
    .eq("user_id", target.id)
    .eq("date", today)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      {
        error: `${target.full_name} already checked in today`,
        already: true,
      },
      { status: 409 }
    );
  }

  const checkedAt = new Date();

  const { error: insErr } = await supabase.from("attendance").insert({
    user_id: target.id,
    date: today,
    checked_in_at: checkedAt.toISOString(),
    method: "qr",
    marked_by: user.id,
  });
  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    name: target.full_name,
    time: checkedAt.toISOString(),
  });
}
