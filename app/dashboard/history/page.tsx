import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { getUserAttendanceHistory } from "@/lib/queries/attendance";
import { HistoryView } from "@/components/dashboard/HistoryView";

export const metadata: Metadata = { title: "My History" };
export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  const records = await getUserAttendanceHistory(profile.id);

  return (
    <HistoryView
      records={records}
      joinedAt={profile.created_at}
      fullName={profile.full_name}
    />
  );
}
