import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import Link from "next/link";
import { AlertCircle, ChevronRight } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import {
  getApprovedMembers,
  getPendingMembers,
} from "@/lib/queries/profiles";
import {
  getAttendanceForDate,
  getAttendanceInRange,
} from "@/lib/queries/attendance";
import { Button } from "@/components/ui/button";
import { formatDateISO } from "@/lib/utils";
import type { FeedItem } from "@/components/admin/LiveCheckInFeed";

const AdminOverviewBody = nextDynamic(
  () => import("@/components/admin/AdminOverviewBody"),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
          <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
        </div>
        <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
      </div>
    ),
  }
);

export const metadata: Metadata = { title: "Admin Overview" };
export const dynamic = "force-dynamic";

function safeMethod(m: string): FeedItem["method"] {
  const u = (m ?? "").toLowerCase();
  if (u === "qr" || u === "manual" || u === "admin") return u;
  return "admin";
}

function buildFeed(
  todayAttendance: Awaited<ReturnType<typeof getAttendanceForDate>>
): FeedItem[] {
  return todayAttendance.map((a) => ({
    id: String(a.id),
    user_id: String(a.user_id),
    full_name: String(a.profile?.full_name ?? "Member"),
    avatar_url: a.profile?.avatar_url ?? null,
    team: String(a.profile?.team ?? ""),
    method: safeMethod(String(a.method ?? "admin")),
    checked_in_at:
      typeof a.checked_in_at === "string" && a.checked_in_at
        ? a.checked_in_at
        : new Date().toISOString(),
  }));
}

export default async function AdminOverview() {
  const today = formatDateISO(new Date());
  const sevenAgo = formatDateISO(subDays(new Date(), 6));

  let members: Awaited<ReturnType<typeof getApprovedMembers>> = [];
  let pending: Awaited<ReturnType<typeof getPendingMembers>> = [];
  let todayAttendance: Awaited<ReturnType<typeof getAttendanceForDate>> = [];
  let weekAttendance: Awaited<ReturnType<typeof getAttendanceInRange>> = [];

  const settled = await Promise.allSettled([
    getApprovedMembers(),
    getPendingMembers(),
    getAttendanceForDate(today),
    getAttendanceInRange(sevenAgo, today),
  ]);

  if (settled[0].status === "fulfilled") members = settled[0].value;
  else console.error("[AdminOverview] getApprovedMembers", settled[0].reason);
  if (settled[1].status === "fulfilled") pending = settled[1].value;
  else console.error("[AdminOverview] getPendingMembers", settled[1].reason);
  if (settled[2].status === "fulfilled") todayAttendance = settled[2].value;
  else console.error("[AdminOverview] getAttendanceForDate", settled[2].reason);
  if (settled[3].status === "fulfilled") weekAttendance = settled[3].value;
  else console.error("[AdminOverview] getAttendanceInRange", settled[3].reason);

  const memberCount = members.filter((m) => m.role === "member").length;
  const presentToday = todayAttendance.length;
  const absentToday = Math.max(0, memberCount - presentToday);
  const rate =
    memberCount === 0 ? 0 : Math.round((presentToday / memberCount) * 1000) / 10;

  const days: { date: string; rate: number }[] = [];
  const dayPresent: Record<string, number> = {};
  for (const a of weekAttendance) {
    if (a.date) dayPresent[a.date] = (dayPresent[a.date] ?? 0) + 1;
  }
  for (let i = 6; i >= 0; i--) {
    const d = startOfDay(subDays(new Date(), i));
    const iso = formatDateISO(d);
    const rawRate =
      memberCount === 0
        ? 0
        : Math.round(((dayPresent[iso] ?? 0) / memberCount) * 100);
    days.push({
      date: format(d, "EEE"),
      rate: Number.isFinite(rawRate) ? rawRate : 0,
    });
  }

  const feed = buildFeed(todayAttendance);

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div className="fade-up flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-display font-semibold text-amber-950">
                {pending.length} pending registration
                {pending.length === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-sm text-amber-900">
                Review and approve new members.
              </p>
            </div>
          </div>
          <Button
            asChild
            className="shrink-0 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 active:scale-[0.98]"
          >
            <Link href="/admin/approvals">
              Review
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      <AdminOverviewBody
        memberCount={memberCount}
        presentToday={presentToday}
        absentToday={absentToday}
        rate={rate}
        days={days}
        feed={feed}
      />
    </div>
  );
}
