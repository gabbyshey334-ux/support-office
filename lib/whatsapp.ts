import { format } from "date-fns";

export interface DailySummaryParams {
  recipientName: string;
  date: Date;
  totalMembers: number;
  presentCount: number;
  absentCount: number;
  presentNames: string[];
  absentNames: string[];
}

export function buildDailySummary(params: DailySummaryParams): string {
  const { recipientName, date, totalMembers, presentCount, absentCount, presentNames, absentNames } =
    params;
  const rate = totalMembers === 0 ? 0 : Math.round((presentCount / totalMembers) * 100);
  const presentList = presentNames.length > 0 ? presentNames.join(", ") : "—";
  const absentList = absentNames.length > 0 ? absentNames.join(", ") : "—";

  return [
    `Good day ${recipientName}! Here is today's Support Office summary:`,
    "",
    `Date: ${format(date, "EEEE, dd MMM yyyy")}`,
    `Present: ${presentCount} members`,
    `Absent: ${absentCount} members`,
    `Rate: ${rate}%`,
    "",
    `Present: ${presentList}`,
    `Absent: ${absentList}`,
    "",
    "— FHG & Neolife Support Office",
  ].join("\n");
}

export interface PersonalCheckInParams {
  fullName: string;
  checkedInAt: Date;
}

export function buildPersonalCheckIn(params: PersonalCheckInParams): string {
  const { fullName, checkedInAt } = params;
  const time = format(checkedInAt, "h:mm a");
  const date = format(checkedInAt, "EEEE, dd MMM yyyy");
  return `${fullName}, your attendance has been marked at ${time} on ${date}. Keep it up! — Support Office`;
}

export function normalizeWhatsAppNumber(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith("whatsapp:")) return trimmed;
  return `whatsapp:${trimmed.startsWith("+") ? trimmed : `+${trimmed}`}`;
}
