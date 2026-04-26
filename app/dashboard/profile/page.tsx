import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { computeStats, getOwnAttendance } from "@/lib/queries/attendance";
import Topbar from "@/components/Topbar";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) redirect("/login");

  const history = await getOwnAttendance(supabase, profile.id, 90);
  const stats = computeStats(history);

  return (
    <>
      <Topbar
        title="Profile"
        profile={profile}
        description="Your personal account & attendance overview"
      />
      <div className="px-4 py-6 md:px-8 md:py-8">
        <ProfileClient profile={profile} history={history} stats={stats} />
      </div>
    </>
  );
}
