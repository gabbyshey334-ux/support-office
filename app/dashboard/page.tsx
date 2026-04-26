import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/queries/profiles";

export default async function DashboardIndex() {
  const supabase = createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) redirect("/login");
  if (profile.role === "member") redirect("/dashboard/attendance");
  redirect("/dashboard/today");
}
