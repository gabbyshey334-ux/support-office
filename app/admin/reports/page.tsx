import type { Metadata } from "next";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
} from "date-fns";
import {
  getRangeReport,
  getAttendanceInRange,
} from "@/lib/queries/attendance";
import { getApprovedMembers } from "@/lib/queries/profiles";
import { ReportsView } from "@/components/admin/ReportsView";
import { formatDateISO } from "@/lib/utils";

export const metadata: Metadata = { title: "Reports" };
export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const from = searchParams.from || formatDateISO(startOfMonth(new Date()));
  const to = searchParams.to || formatDateISO(endOfMonth(new Date()));

  const [rows, attendance, members] = await Promise.all([
    getRangeReport(from, to),
    getAttendanceInRange(from, to),
    getApprovedMembers(),
  ]);

  const memberCount = members.filter((m) => m.role === "member").length;
  const days = eachDayOfInterval({
    start: new Date(from),
    end: new Date(to),
  });
  const presentByDay: Record<string, number> = {};
  for (const a of attendance) {
    presentByDay[a.date] = (presentByDay[a.date] ?? 0) + 1;
  }
  const dailyData = days.map((d) => {
    const iso = format(d, "yyyy-MM-dd");
    const present = presentByDay[iso] ?? 0;
    return { date: iso, present, absent: Math.max(0, memberCount - present) };
  });

  return (
    <ReportsView from={from} to={to} rows={rows} dailyData={dailyData} />
  );
}
