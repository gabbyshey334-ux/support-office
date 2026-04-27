import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import Link from "next/link";
import {
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import {
  getApprovedMembers,
  getPendingMembers,
} from "@/lib/queries/profiles";
import {
  getAttendanceForDate,
  getAttendanceInRange,
} from "@/lib/queries/attendance";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LiveCheckInFeed, type FeedItem } from "@/components/admin/LiveCheckInFeed";

const AdminOverviewChartsClient = nextDynamic(
  () => import("@/components/admin/AdminOverviewChartsClient"),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
      </div>
    ),
  }
);
import { Button } from "@/components/ui/button";
import { formatDateISO } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin Overview" };
export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const today = formatDateISO(new Date());
  const sevenAgo = formatDateISO(subDays(new Date(), 6));

  const [members, pending, todayAttendance, weekAttendance] = await Promise.all([
    getApprovedMembers(),
    getPendingMembers(),
    getAttendanceForDate(today),
    getAttendanceInRange(sevenAgo, today),
  ]);

  const memberCount = members.filter((m) => m.role === "member").length;
  const presentToday = todayAttendance.length;
  const absentToday = Math.max(0, memberCount - presentToday);
  const rate =
    memberCount === 0 ? 0 : Math.round((presentToday / memberCount) * 1000) / 10;

  // Build 7-day trend
  const days: { date: string; rate: number }[] = [];
  const dayPresent: Record<string, number> = {};
  for (const a of weekAttendance) {
    dayPresent[a.date] = (dayPresent[a.date] ?? 0) + 1;
  }
  for (let i = 6; i >= 0; i--) {
    const d = startOfDay(subDays(new Date(), i));
    const iso = formatDateISO(d);
    days.push({
      date: format(d, "EEE"),
      rate:
        memberCount === 0
          ? 0
          : Math.round(((dayPresent[iso] ?? 0) / memberCount) * 100),
    });
  }

  const feed: FeedItem[] = todayAttendance.map((a) => ({
    id: a.id,
    user_id: a.user_id,
    full_name: a.profile.full_name,
    avatar_url: a.profile.avatar_url,
    team: a.profile.team,
    method: a.method,
    checked_in_at: a.checked_in_at,
  }));

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div className="fade-up flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-display font-semibold text-amber-950">
                {pending.length} pending registration{pending.length === 1 ? "" : "s"}
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Total Members"
          value={memberCount}
          icon={Users}
          color="blue"
          delay={0}
          fadeClass="fade-up-0"
        />
        <StatsCard
          title="Present Today"
          value={presentToday}
          icon={CheckCircle}
          color="green"
          delay={0.05}
          fadeClass="fade-up-1"
        />
        <StatsCard
          title="Absent Today"
          value={absentToday}
          icon={XCircle}
          color="red"
          delay={0.1}
          fadeClass="fade-up-2"
        />
        <StatsCard
          title="Attendance Rate"
          value={rate}
          suffix="%"
          icon={TrendingUp}
          color="amber"
          delay={0.15}
          fadeClass="fade-up-3"
        />
      </div>

      <AdminOverviewChartsClient
        presentToday={presentToday}
        absentToday={absentToday}
        days={days}
      />

      <LiveCheckInFeed initial={feed} />
    </div>
  );
}
