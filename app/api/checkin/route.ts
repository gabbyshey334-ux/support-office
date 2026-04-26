import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, getProfileById } from "@/lib/queries/profiles";
import { checkInUser } from "@/lib/queries/attendance";
import { checkInSchema } from "@/lib/validations";
import { format, parseISO } from "date-fns";
import { buildPersonalCheckIn } from "@/lib/whatsapp";
import { sendWhatsAppMessage } from "@/app/api/whatsapp/_send";

export async function POST(request: Request) {
  const supabase = createClient();
  const me = await getCurrentProfile(supabase);
  if (!me) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = checkInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Invalid QR code" },
      { status: 400 }
    );
  }

  const scannedId = parsed.data.scanned_id;

  // Members may only check in themselves; admins may check in anyone.
  if (me.role !== "admin" && scannedId !== me.id) {
    return NextResponse.json(
      { success: false, message: "This QR code does not belong to you." },
      { status: 403 }
    );
  }

  const target = await getProfileById(supabase, scannedId);
  if (!target) {
    return NextResponse.json(
      { success: false, message: "Unknown member QR code." },
      { status: 404 }
    );
  }
  if (!target.is_active) {
    return NextResponse.json(
      { success: false, message: "This account is inactive." },
      { status: 403 }
    );
  }

  try {
    const { inserted, row, existing } = await checkInUser(supabase, {
      userId: target.id,
      method: me.role === "admin" && scannedId !== me.id ? "admin" : "qr",
      markedBy: me.id,
    });

    if (!inserted && existing) {
      const time = format(parseISO(existing.checked_in_at), "h:mm a");
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        message: `Already checked in at ${time}`,
        time,
        attendance: existing,
      });
    }

    if (row && target.phone_whatsapp) {
      // Fire-and-forget WhatsApp confirmation.
      sendWhatsAppMessage(
        target.phone_whatsapp,
        buildPersonalCheckIn({
          fullName: target.full_name,
          checkedInAt: parseISO(row.checked_in_at),
        })
      ).catch((err) => console.error("WhatsApp confirmation failed:", err));
    }

    const time = row ? format(parseISO(row.checked_in_at), "h:mm a") : "";
    return NextResponse.json({
      success: true,
      alreadyCheckedIn: false,
      message: `Attendance marked at ${time}`,
      time,
      attendance: row,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Check-in failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
