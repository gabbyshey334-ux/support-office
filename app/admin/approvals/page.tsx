import type { Metadata } from "next";
import { getPendingMembers } from "@/lib/queries/profiles";
import { ApprovalsTable } from "@/components/admin/ApprovalsTable";

export const metadata: Metadata = { title: "Pending Approvals" };
export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const pending = await getPendingMembers();

  return (
    <div className="fade-up space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
          Pending Approvals
        </h1>
        {pending.length > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
            {pending.length}
          </span>
        )}
      </div>
      <ApprovalsTable pending={pending} />
    </div>
  );
}
