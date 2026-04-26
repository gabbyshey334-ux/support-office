import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ErrorBoundary from "@/components/ErrorBoundary";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/queries/profiles";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentProfile(supabase);

  if (!profile) {
    // Stale session: auth user exists but no profile row. Sign out and bounce.
    await supabase.auth.signOut();
    redirect("/login?error=missing_profile");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar profile={profile} />
      <div className="md:pl-[260px]">
        <ErrorBoundary>
          <main className="pb-24 md:pb-0">{children}</main>
        </ErrorBoundary>
      </div>
    </div>
  );
}
