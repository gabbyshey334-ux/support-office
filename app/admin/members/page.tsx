import type { Metadata } from "next";
import { getAllMembers } from "@/lib/queries/profiles";
import { MembersTable } from "@/components/admin/MembersTable";

export const metadata: Metadata = { title: "Members" };
export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await getAllMembers();
  const memberList = members.filter((m) => m.role === "member");

  return (
    <div className="fade-up space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
            Members
          </h1>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            {memberList.length}
          </span>
        </div>
      </div>
      <MembersTable members={memberList} />
    </div>
  );
}
