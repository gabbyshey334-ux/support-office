import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function formatDate(date: string | Date, fmt = "EEE, MMM d, yyyy") {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatTime(iso: string) {
  return format(parseISO(iso), "h:mm a");
}

export function formatDateISO(date: Date) {
  return format(date, "yyyy-MM-dd");
}

/**
 * Normalises a Nigerian phone number to E.164 (+234XXXXXXXXXX).
 * Accepts: 08123456789, +2348123456789, 2348123456789, 8123456789
 */
export function normaliseNigerianPhone(raw: string): string {
  let digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("234")) {
    return `+${digits}`;
  }
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return `+234${digits}`;
}

export function calculateStreak(
  presentDates: string[]
): { current: number; best: number } {
  if (presentDates.length === 0) return { current: 0, best: 0 };

  const sorted = [...new Set(presentDates)].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 1) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }

  // current streak: consecutive days ending today or yesterday
  const todayStr = formatDateISO(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = formatDateISO(yesterday);
  let current = 0;
  if (sorted.includes(todayStr) || sorted.includes(yStr)) {
    let cursor = sorted.includes(todayStr) ? new Date() : yesterday;
    while (sorted.includes(formatDateISO(cursor))) {
      current += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  return { current, best };
}

export function attendanceRateColor(rate: number): string {
  if (rate >= 70) return "#059669";
  if (rate >= 40) return "#D97706";
  return "#DC2626";
}

export function isToday(iso: string): boolean {
  return iso.slice(0, 10) === formatDateISO(new Date());
}
