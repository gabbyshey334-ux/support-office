import { redirect } from "next/navigation";
import { getCurrentProfile, countPendingMembers } from "@/lib/queries/profiles";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard");

  const pendingCount = await countPendingMembers();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar profile={profile} pendingCount={pendingCount} />
      <div className="lg:pl-[260px]">
        <AdminTopbar profile={profile} />
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
