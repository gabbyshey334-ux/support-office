import type { Metadata } from "next";
import { getApprovedMembers } from "@/lib/queries/profiles";
import { getAttendanceForDate } from "@/lib/queries/attendance";
import { AttendancePanel } from "@/components/admin/AttendancePanel";
import { formatDateISO } from "@/lib/utils";

export const metadata: Metadata = { title: "Attendance" };
export const dynamic = "force-dynamic";

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams.date || formatDateISO(new Date());
  const [members, attendance] = await Promise.all([
    getApprovedMembers(),
    getAttendanceForDate(date),
  ]);

  return (
    <AttendancePanel
      initialDate={date}
      members={members.filter((m) => m.role === "member")}
      initialAttendance={attendance}
    />
  );
}
