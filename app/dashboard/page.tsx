import type { Metadata } from "next";
import {
  CalendarCheck,
  Flame,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { getCurrentProfile } from "@/lib/queries/profiles";
import {
  getTodayAttendanceForUser,
  getUserAttendanceHistory,
  getUserStats,
} from "@/lib/queries/attendance";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AttendanceCalendar } from "@/components/dashboard/AttendanceCalendar";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { redirect } from "next/navigation";
import { formatDate, formatDateISO } from "@/lib/utils";
import { startOfMonth, endOfMonth } from "date-fns";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

function methodLabel(m: string) {
  const u = m.toLowerCase();
  if (u === "qr") return "QR";
  if (u === "manual") return "Manual";
  if (u === "admin") return "Admin";
  return m;
}

export default async function DashboardHome() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const [todayAttendance, history, stats] = await Promise.all([
    getTodayAttendanceForUser(profile.id),
    getUserAttendanceHistory(profile.id),
    getUserStats(profile.id, profile.created_at),
  ]);

  const monthStart = formatDateISO(startOfMonth(new Date()));
  const monthEnd = formatDateISO(endOfMonth(new Date()));
  const monthRecords = history.filter(
    (r) => r.date >= monthStart && r.date <= monthEnd
  );
  const todayDate = new Date();
  const daysSoFar = todayDate.getDate();
  const monthRate =
    daysSoFar === 0
      ? 0
      : Math.round((monthRecords.length / daysSoFar) * 1000) / 10;

  const isCheckedIn = !!todayAttendance;
  const firstName = profile.full_name.split(" ")[0];
  const checkTime = todayAttendance
    ? format(parseISO(todayAttendance.checked_in_at), "h:mm a")
    : null;
  const checkMethod = todayAttendance
    ? methodLabel(todayAttendance.method)
    : null;

  const hour = new Date().getHours();
  const greetBucket =
    hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  return (
    <div className="fade-up space-y-6 md:space-y-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-base text-slate-600">
            Good {greetBucket},
          </p>
          <p className="font-display text-3xl font-bold text-slate-900 md:text-[32px]">
            {firstName}{" "}
            <span className="inline-block" aria-hidden>
              👋
            </span>
          </p>
        </div>
        <p className="text-sm text-slate-600 sm:text-right">
          {formatDate(new Date())}
        </p>
      </div>

      {isCheckedIn ? (
        <div
          className="relative overflow-hidden rounded-2xl p-6 md:p-8"
          style={{
            background: "linear-gradient(135deg, #065F46, #059669)",
          }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-40">
            {[...Array(6)].map((_, i) => (
              <span
                key={i}
                className="absolute h-3 w-1 rounded-sm bg-white/90"
                style={{
                  left: `${12 + i * 14}%`,
                  top: `${18 + (i % 3) * 22}%`,
                  transform: `rotate(${-30 + i * 17}deg)`,
                }}
              />
            ))}
          </div>
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-green-600 shadow-lg md:h-14 md:w-14">
                <CheckCircle className="h-8 w-8" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-white md:text-2xl">
                  Checked In
                </p>
                <p className="mt-1 text-sm text-green-100">
                  at {checkTime} via {checkMethod}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-start gap-4">
            <Clock className="mt-1 h-12 w-12 shrink-0 text-slate-400" />
            <div>
              <p className="font-display text-xl font-semibold text-slate-800 md:text-[22px]">
                Not Checked In Yet
              </p>
              <p className="mt-1 text-sm text-slate-600">
                An administrator records attendance when you arrive. Show your QR
                from{" "}
                <a
                  href="/dashboard/attendance"
                  className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-800"
                >
                  My QR
                </a>{" "}
                if asked.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Today's Status"
          value={isCheckedIn ? "Present" : "Absent"}
          icon={CheckCircle}
          color={isCheckedIn ? "green" : "red"}
          delay={0}
          fadeClass="fade-up-0"
          change={
            isCheckedIn
              ? "You are on the board for today"
              : "Admin will mark you present when you check in"
          }
          changePositive={isCheckedIn}
        />
        <StatsCard
          title="Current Streak"
          value={stats.currentStreak}
          suffix=" days"
          icon={Flame}
          color="amber"
          delay={0.05}
          fadeClass="fade-up-1"
          change={`Best record: ${stats.bestStreak} days`}
          changePositive
        />
        <StatsCard
          title="This Month %"
          value={monthRate}
          suffix="%"
          icon={TrendingUp}
          color="blue"
          delay={0.1}
          fadeClass="fade-up-2"
          change={`${monthRecords.length} days present`}
          changePositive
        />
        <StatsCard
          title="Total Days"
          value={stats.presentDays}
          icon={CalendarCheck}
          color="slate"
          delay={0.15}
          fadeClass="fade-up-3"
          change={`All-time present count`}
          changePositive
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AttendanceCalendar
          presentDates={history.map((h) => h.date)}
          joinedAt={profile.created_at}
        />
        <RecentActivity records={history} />
      </div>
    </div>
  );
}
