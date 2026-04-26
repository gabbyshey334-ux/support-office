import { redirect } from "next/navigation";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, listProfiles } from "@/lib/queries/profiles";
import { getAttendanceInRange } from "@/lib/queries/attendance";
import Topbar from "@/components/Topbar";
import ReportsClient from "./ReportsClient";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard/today");

  const start = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const end = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const [profiles, attendance] = await Promise.all([
    listProfiles(supabase, { activeOnly: true }),
    getAttendanceInRange(supabase, start, end),
  ]);

  return (
    <>
      <Topbar
        title="Reports"
        profile={profile}
        description="Analyse attendance trends and export reports"
      />
      <div className="px-4 py-6 md:px-8 md:py-8">
        <ReportsClient
          initialStart={start}
          initialEnd={end}
          initialProfiles={profiles}
          initialAttendance={attendance}
        />
      </div>
    </>
  );
}
