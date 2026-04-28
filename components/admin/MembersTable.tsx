"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  UserX,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MemberSlideOver } from "./MemberSlideOver";
import { Spinner } from "@/components/ui/spinner";
import { getInitials } from "@/lib/utils";
import {
  deleteMemberAction,
  updateMemberAction,
} from "@/lib/actions/admin";
import {
  MEMBER_STATUS_OPTIONS,
  memberStatusLabel,
  type AccountStatus,
  type MemberStatus,
  type Profile,
} from "@/types";

function memberStatusDot(status: string) {
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

function accountBadgeClass(s: AccountStatus): string {
  if (s === "approved") return "badge-present";
  if (s === "pending") return "badge-pending";
  return "badge-absent";
}

export function MembersTable({ members }: { members: Profile[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Profile | null>(null);
  const [pending, startTransition] = useTransition();

  const teams = useMemo(
    () => Array.from(new Set(members.map((m) => m.team))),
    [members]
  );

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (
        query &&
        !`${m.full_name} ${m.sponsor_name} ${m.upline_name} ${m.phone}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
        return false;
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (accountFilter !== "all" && m.account_status !== accountFilter)
        return false;
      if (teamFilter !== "all" && m.team !== teamFilter) return false;
      return true;
    });
  }, [members, query, statusFilter, accountFilter, teamFilter]);

  const onToggleActive = (m: Profile) => {
    startTransition(async () => {
      const next = m.account_status === "approved" ? "rejected" : "approved";
      const res = await updateMemberAction(m.id, { account_status: next });
      if (!res.ok) toast.error(res.error);
      else {
        toast.success(
          next === "approved" ? "Member activated" : "Member deactivated"
        );
        router.refresh();
      }
    });
  };

  const onDelete = (m: Profile) => {
    startTransition(async () => {
      const res = await deleteMemberAction(m.id);
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("Member deleted");
        setConfirmDelete(null);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-end justify-between">
        <div className="flex-1 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search by name, sponsor, upline..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 rounded-xl border-slate-300 pl-9 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 rounded-xl border-slate-300 focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Member status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {MEMBER_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger className="h-10 rounded-xl border-slate-300 focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Account Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="h-10 rounded-xl border-slate-300 focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teams</SelectItem>
              {teams.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 active:scale-[0.98]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-8" />
              <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Member
              </TableHead>
              <TableHead className="hidden text-xs font-medium uppercase tracking-wider text-slate-600 md:table-cell">
                Sponsor
              </TableHead>
              <TableHead className="hidden text-xs font-medium uppercase tracking-wider text-slate-600 lg:table-cell">
                Upline
              </TableHead>
              <TableHead className="hidden text-xs font-medium uppercase tracking-wider text-slate-600 lg:table-cell">
                Member status
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Account
              </TableHead>
              <TableHead className="hidden text-xs font-medium uppercase tracking-wider text-slate-600 xl:table-cell">
                Joined
              </TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-slate-600">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-14 text-center text-slate-600"
                >
                  <Search className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                  <p className="font-display font-semibold text-slate-800">
                    No members found
                  </p>
                  <p className="mt-1 text-sm">Try adjusting filters or search.</p>
                </TableCell>
              </TableRow>
            )}
            {filtered.map((m) => (
              <Fragment key={m.id}>
                <TableRow className="border-b border-slate-100 transition hover:bg-slate-50">
                  <TableCell>
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((x) => (x === m.id ? null : m.id))
                      }
                      className="text-slate-400 hover:text-slate-700"
                      aria-label="Expand"
                    >
                      {expanded === m.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-100">
                        {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                        <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
                          {getInitials(m.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{m.full_name}</p>
                        <p className="truncate text-xs text-slate-600">
                          {m.phone}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden py-3.5 text-sm text-slate-700 md:table-cell">
                    {m.sponsor_name}
                  </TableCell>
                  <TableCell className="hidden py-3.5 text-sm text-slate-700 lg:table-cell">
                    {m.upline_name}
                  </TableCell>
                  <TableCell className="hidden py-3.5 lg:table-cell">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${memberStatusDot(m.status)}`}
                      />
                      {memberStatusLabel(m.status)}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span className={accountBadgeClass(m.account_status)}>
                      {m.account_status}
                    </span>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-slate-500">
                    {format(new Date(m.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="py-3.5 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit"
                        className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        onClick={() => {
                          setEditing(m);
                          setOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={
                          m.account_status === "approved"
                            ? "Deactivate"
                            : "Activate"
                        }
                        className="text-slate-600 hover:bg-slate-100"
                        onClick={() => onToggleActive(m)}
                        disabled={pending}
                      >
                        {m.account_status === "approved" ? (
                          <UserX className="h-4 w-4 text-red-600" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        className="text-slate-600 hover:bg-red-50 hover:text-red-600"
                        onClick={() => setConfirmDelete(m)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expanded === m.id && <ExpandedRow member={m} />}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <MemberSlideOver
        open={open}
        onOpenChange={setOpen}
        member={editing}
        key={editing?.id ?? "new"}
      />

      <Dialog
        open={!!confirmDelete}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete member?</DialogTitle>
            <DialogDescription>
              This will permanently delete{" "}
              <span className="font-medium">
                {confirmDelete?.full_name}
              </span>{" "}
              and all their attendance data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={pending}
              onClick={() => confirmDelete && onDelete(confirmDelete)}
            >
              {pending ? <Spinner /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExpandedRow({ member }: { member: Profile }) {
  return (
    <TableRow className="bg-slate-50 hover:bg-slate-50">
      <TableCell colSpan={8}>
        <div className="px-4 py-3 grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <KV label="Date of Birth" value={member.date_of_birth} />
          <KV label="Sponsor" value={member.sponsor_name} />
          <KV label="Upline" value={member.upline_name} />
          <KV label="Team" value={member.team} />
          <KV
            label="Joined"
            value={format(new Date(member.created_at), "MMM d, yyyy")}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
        {label}
      </p>
      <p className="font-medium text-slate-900 mt-0.5">{value}</p>
    </div>
  );
}
