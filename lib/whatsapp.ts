import "server-only";
import twilio from "twilio";
import { format } from "date-fns";
import { normaliseNigerianPhone } from "./utils";

let cachedClient: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (cachedClient) return cachedClient;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    return null;
  }
  cachedClient = twilio(sid, token);
  return cachedClient;
}

function fromNumber() {
  return process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886";
}

async function send(toRaw: string, body: string) {
  const client = getClient();
  if (!client) {
    console.warn("[whatsapp] Twilio not configured. Skipping message.");
    return { ok: false, skipped: true };
  }
  const to = `whatsapp:${normaliseNigerianPhone(toRaw)}`;
  try {
    const msg = await client.messages.create({ from: fromNumber(), to, body });
    return { ok: true, sid: msg.sid };
  } catch (err) {
    console.error("[whatsapp] send failed", err);
    return { ok: false, error: (err as Error).message };
  }
}

export async function sendApprovalMessage(opts: {
  phone: string;
  name: string;
}) {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "https://support-office.app";
  const body = `Hi ${opts.name}! 🎉 Your Support Office account has been approved.\nYou can now log in at ${url}, view your QR for admins, and track your attendance after they record you each day. Keep showing up! — FHG & Neolife Support Office`;
  return send(opts.phone, body);
}

export async function sendRejectionMessage(opts: {
  phone: string;
  name: string;
}) {
  const body = `Hi ${opts.name}, your Support Office registration was not approved at this time. Contact your upline for assistance. — FHG & Neolife Support Office`;
  return send(opts.phone, body);
}

export async function sendCheckInConfirmation(opts: {
  phone: string;
  name: string;
  checkedInAt: Date;
}) {
  const time = format(opts.checkedInAt, "h:mm a");
  const date = format(opts.checkedInAt, "EEE, MMM d");
  const body = `✅ ${opts.name}, your attendance has been recorded at ${time} on ${date}. Keep the streak going! 🔥 — Support Office`;
  return send(opts.phone, body);
}

export async function sendDailySummary(opts: {
  phone: string;
  date: Date;
  presentNames: string[];
  absentNames: string[];
}) {
  const total = opts.presentNames.length + opts.absentNames.length;
  const rate =
    total === 0
      ? 0
      : Math.round((opts.presentNames.length / total) * 100 * 10) / 10;
  const body = `📊 *Support Office Daily Report*\nDate: ${format(
    opts.date,
    "EEE, MMM d, yyyy"
  )}\n✅ Present: ${opts.presentNames.length} members\n❌ Absent: ${
    opts.absentNames.length
  } members\n📈 Rate: ${rate}%\n\nPresent: ${
    opts.presentNames.length === 0 ? "—" : opts.presentNames.join(", ")
  }\nAbsent: ${opts.absentNames.length === 0 ? "—" : opts.absentNames.join(", ")}\n\n— FHG & Neolife Support Office`;
  return send(opts.phone, body);
}
