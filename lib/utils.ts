import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | Date, pattern: string = "PP"): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return "";
  return format(date, pattern);
}

export function formatTime(value: string | Date): string {
  return formatDate(value, "h:mm a");
}

export function formatDateTime(value: string | Date): string {
  return formatDate(value, "PP 'at' h:mm a");
}

export function formatRelative(value: string | Date): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return "";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function dayName(value: string | Date): string {
  return formatDate(value, "EEEE");
}

export function classifyRate(rate: number): "high" | "medium" | "low" {
  if (rate > 70) return "high";
  if (rate >= 40) return "medium";
  return "low";
}

export function rateColor(rate: number): string {
  const tier = classifyRate(rate);
  if (tier === "high") return "text-success-700 bg-success-50";
  if (tier === "medium") return "text-warning-700 bg-warning-50";
  return "text-danger-700 bg-danger-50";
}

export function avatarUrl(name: string): string {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1A56DB&textColor=ffffff`;
}
