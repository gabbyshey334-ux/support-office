import twilio from "twilio";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

let cachedClient: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (cachedClient) return cachedClient;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error(
      "Twilio not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN."
    );
  }
  cachedClient = twilio(sid, token);
  return cachedClient;
}

export async function sendWhatsAppMessage(
  to: string,
  body: string
): Promise<{ sid: string }> {
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!from) {
    throw new Error("TWILIO_WHATSAPP_FROM not configured.");
  }
  const client = getClient();
  const message = await client.messages.create({
    from,
    to: normalizeWhatsAppNumber(to),
    body,
  });
  return { sid: message.sid };
}
