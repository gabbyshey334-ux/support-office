import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { MemberSidebar } from "@/components/dashboard/MemberSidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin");
  if (profile.account_status === "pending") redirect("/pending");
  if (profile.account_status === "rejected") redirect("/login");

  return (
    <div className="min-h-screen bg-[var(--so-slate-50)]">
      <MemberSidebar profile={profile} />
      <div className="lg:pl-60">
        <Topbar profile={profile} />
        <main className="p-4 pb-24 md:p-8 md:pb-8 lg:pb-8">{children}</main>
      </div>
    </div>
  );
}
