import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, listProfiles } from "@/lib/queries/profiles";
import { getTodayAttendance } from "@/lib/queries/attendance";
import Topbar from "@/components/Topbar";
import TodayClient from "./TodayClient";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) redirect("/login");
  if (profile.role === "member") redirect("/dashboard/attendance");

  const teamFilter =
    profile.role === "leader" ? profile.team : undefined;

  const [allProfiles, attendance] = await Promise.all([
    listProfiles(supabase, {
      activeOnly: true,
      ...(teamFilter ? { team: teamFilter } : {}),
    }),
    getTodayAttendance(supabase, teamFilter),
  ]);

  return (
    <>
      <Topbar
        title="Today's Attendance"
        profile={profile}
        description={
          teamFilter
            ? `Team: ${teamFilter}`
            : "All members across the Support Office"
        }
      />
      <div className="px-4 py-6 md:px-8 md:py-8">
        <TodayClient
          profile={profile}
          allProfiles={allProfiles}
          initialAttendance={attendance}
        />
      </div>
    </>
  );
}
