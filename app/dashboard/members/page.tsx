import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, listProfiles } from "@/lib/queries/profiles";
import { getAttendanceInRange } from "@/lib/queries/attendance";
import { startOfMonth, endOfMonth, format } from "date-fns";
import Topbar from "@/components/Topbar";
import MembersClient from "./MembersClient";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard/today");

  const profiles = await listProfiles(supabase);
  const start = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const end = format(endOfMonth(new Date()), "yyyy-MM-dd");
  const monthAttendance = await getAttendanceInRange(supabase, start, end);

  return (
    <>
      <Topbar
        title="Members"
        profile={profile}
        description="Manage members, teams, and access"
      />
      <div className="px-4 py-6 md:px-8 md:py-8">
        <MembersClient
          profiles={profiles}
          monthAttendance={monthAttendance}
        />
      </div>
    </>
  );
}
