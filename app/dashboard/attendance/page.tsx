import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { computeStats, getOwnAttendance } from "@/lib/queries/attendance";
import { redirect } from "next/navigation";
import Topbar from "@/components/Topbar";
import AttendanceClient from "./AttendanceClient";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const supabase = createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) redirect("/login");

  const history = await getOwnAttendance(supabase, profile.id, 90);
  const stats = computeStats(history);
  const today = history.find(
    (h) => h.date === new Date().toISOString().slice(0, 10)
  );

  return (
    <>
      <Topbar title="Check-in" profile={profile} />
      <div className="px-4 py-6 md:px-8 md:py-8">
        <AttendanceClient
          profile={profile}
          initialHistory={history}
          initialStats={stats}
          initialTodayCheckIn={today ?? null}
        />
      </div>
    </>
  );
}
