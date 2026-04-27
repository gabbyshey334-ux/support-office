import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendApprovalMessage,
  sendCheckInConfirmation,
  sendDailySummary,
  sendRejectionMessage,
} from "@/lib/whatsapp";

export const runtime = "nodejs";

/**
 * Generic admin-only endpoint to dispatch WhatsApp messages.
 *
 * Body: {
 *   type: 'approval' | 'rejection' | 'check_in' | 'daily_summary',
 *   ...payload
 * }
 */
export async function POST(req: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const type = body?.type;
  if (!type) {
    return NextResponse.json({ error: "Missing 'type'" }, { status: 400 });
  }

  try {
    if (type === "approval") {
      const { phone, name } = body;
      if (!phone || !name)
        return NextResponse.json({ error: "phone and name required" }, { status: 400 });
      const r = await sendApprovalMessage({ phone, name });
      return NextResponse.json(r);
    }

    if (type === "rejection") {
      const { phone, name } = body;
      const r = await sendRejectionMessage({ phone, name });
      return NextResponse.json(r);
    }

    if (type === "check_in") {
      const { phone, name, checkedInAt } = body;
      const r = await sendCheckInConfirmation({
        phone,
        name,
        checkedInAt: new Date(checkedInAt ?? Date.now()),
      });
      return NextResponse.json(r);
    }

    if (type === "daily_summary") {
      const { phone, date, presentNames, absentNames } = body;
      const r = await sendDailySummary({
        phone,
        date: new Date(date ?? Date.now()),
        presentNames: presentNames ?? [],
        absentNames: absentNames ?? [],
      });
      return NextResponse.json(r);
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
