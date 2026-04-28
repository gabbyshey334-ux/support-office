"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Check, X, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { approveMemberAction, rejectMemberAction } from "@/lib/actions/admin";
import { getInitials } from "@/lib/utils";
import { memberStatusLabel, type MemberStatus, type Profile } from "@/types";

function statusDot(status: string) {
  const map: Record<MemberStatus, string> = {
    newbie: "bg-slate-400",
    probie: "bg-sky-500",
    pro: "bg-blue-600",
    distributor: "bg-violet-600",
    manager: "bg-amber-500",
    senior_managers: "bg-emerald-600",
  };
  return map[status as MemberStatus] ?? "bg-slate-300";
}

export function ApprovalsTable({ pending }: { pending: Profile[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const onApprove = (m: Profile) => {
    setBusy(m.id);
    startTransition(async () => {
      const res = await approveMemberAction(m.id);
      setBusy(null);
      if (!res.ok) toast.error(res.error);
      else {
        toast.success(
          `${m.full_name} has been approved and can now log in.`
        );
        router.refresh();
      }
    });
  };

  const onReject = (m: Profile) => {
    setBusy(m.id);
    startTransition(async () => {
      const res = await rejectMemberAction(m.id);
      setBusy(null);
      if (!res.ok) toast.error(res.error);
      else {
        toast.error(`${m.full_name}'s registration has been rejected.`);
        router.refresh();
      }
    });
  };

  if (pending.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
        <CheckCircle2 className="h-14 w-14 text-green-500" />
        <h2 className="mt-6 font-display text-xl font-semibold text-slate-900">
          All caught up!
        </h2>
        <p className="mt-2 max-w-sm text-sm text-slate-600">
          No pending registrations. New applications will appear here for review.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-slate-200 bg-slate-50 hover:bg-slate-50">
            <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-600">
              Member Info
            </TableHead>
            <TableHead className="hidden text-xs font-medium uppercase tracking-wider text-slate-600 md:table-cell">
              Sponsor
            </TableHead>
            <TableHead className="hidden text-xs font-medium uppercase tracking-wider text-slate-600 lg:table-cell">
              Upline
            </TableHead>
            <TableHead className="hidden text-xs font-medium uppercase tracking-wider text-slate-600 md:table-cell">
              Status
            </TableHead>
            <TableHead className="hidden text-xs font-medium uppercase tracking-wider text-slate-600 xl:table-cell">
              Registered
            </TableHead>
            <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-slate-600">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pending.map((m) => (
            <TableRow
              key={m.id}
              className="border-b border-slate-100 transition hover:bg-amber-50/80"
            >
              <TableCell className="py-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 border border-slate-100">
                    <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
                      {getInitials(m.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{m.full_name}</p>
                    <p className="text-xs text-slate-600">{m.team}</p>
                    <p className="mt-1 text-xs text-slate-600">{m.phone}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden py-4 text-sm text-slate-700 md:table-cell">
                {m.sponsor_name}
              </TableCell>
              <TableCell className="hidden py-4 text-sm text-slate-700 lg:table-cell">
                {m.upline_name}
              </TableCell>
              <TableCell className="hidden py-4 md:table-cell">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${statusDot(m.status)}`}
                  />
                  {memberStatusLabel(m.status)}
                </span>
              </TableCell>
              <TableCell className="hidden py-4 text-sm text-slate-600 xl:table-cell">
                {format(new Date(m.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="py-4 text-right">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    size="sm"
                    className="rounded-lg bg-green-600 font-semibold text-white hover:bg-green-700 active:scale-[0.98]"
                    onClick={() => onApprove(m)}
                    disabled={busy === m.id}
                  >
                    {busy === m.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="mr-1 h-4 w-4" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-red-200 bg-red-50 font-semibold text-red-700 hover:bg-red-100 active:scale-[0.98]"
                    onClick={() => onReject(m)}
                    disabled={busy === m.id}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
