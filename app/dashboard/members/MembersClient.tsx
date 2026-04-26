"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, KeyRound, Pencil, Plus, Search, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogSlideOver,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { formatRelative, getInitials } from "@/lib/utils";
import type {
  AttendanceWithProfile,
  Profile,
  Role,
} from "@/types";

interface Props {
  profiles: Profile[];
  monthAttendance: AttendanceWithProfile[];
}

interface MemberFormValues {
  full_name: string;
  email: string;
  password: string;
  username: string;
  phone_whatsapp: string;
  role: Role;
  team: string;
}

const EMPTY_FORM: MemberFormValues = {
  full_name: "",
  email: "",
  password: "",
  username: "",
  phone_whatsapp: "",
  role: "member",
  team: "Support Office",
};

export default function MembersClient({ profiles, monthAttendance }: Props) {
  const [list, setList] = useState<Profile[]>(profiles);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [resetting, setResetting] = useState<Profile | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const monthByUser = useMemo(() => {
    const map = new Map<string, AttendanceWithProfile[]>();
    for (const r of monthAttendance) {
      const list = map.get(r.user_id) || [];
      list.push(r);
      map.set(r.user_id, list);
    }
    return map;
  }, [monthAttendance]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return list.filter((p) => {
      const matchesRole = roleFilter === "all" || p.role === roleFilter;
      const matchesQuery =
        !q ||
        p.full_name.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q);
      return matchesRole && matchesQuery;
    });
  }, [list, query, roleFilter]);

  async function toggleActive(p: Profile, next: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: next })
      .eq("id", p.id);
    if (error) {
      toast.error("Failed to update status");
      return;
    }
    setList((prev) =>
      prev.map((row) => (row.id === p.id ? { ...row, is_active: next } : row))
    );
    toast.success(next ? "Member reactivated" : "Member deactivated");
  }

  async function handleCreate(values: MemberFormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      setList((prev) => [data.profile as Profile, ...prev]);
      toast.success("Member created");
      setOpenCreate(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(values: MemberFormValues) {
    if (!editing) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error, data } = await supabase
      .from("profiles")
      .update({
        full_name: values.full_name,
        username: values.username,
        phone_whatsapp: values.phone_whatsapp || null,
        role: values.role,
        team: values.team,
      })
      .eq("id", editing.id)
      .select()
      .single();
    setSubmitting(false);
    if (error) {
      toast.error("Update failed");
      return;
    }
    setList((prev) =>
      prev.map((row) => (row.id === editing.id ? (data as Profile) : row))
    );
    toast.success("Member updated");
    setEditing(null);
  }

  async function handleResetPassword(values: { password: string }) {
    if (!resetting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resetting.id, password: values.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      toast.success("Password reset");
      setResetting(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Reset failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members…"
              className="w-72 pl-9"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as "all" | Role)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="leader">Leader</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setOpenCreate(true)}>
          <UserPlus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last seen</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-slate-500">
                  No members found.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((p) => {
              const records = monthByUser.get(p.id) || [];
              const lastCheckIn = records[records.length - 1]?.checked_in_at;
              const isExpanded = expandedId === p.id;
              return (
                <Fragment key={p.id}>
                  <TableRow>
                    <TableCell>
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : p.id)
                        }
                        className="flex items-center gap-3 text-left"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {getInitials(p.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900">
                            {p.full_name}
                          </p>
                          <p className="text-xs text-slate-500">@{p.username}</p>
                        </div>
                        <ChevronDown
                          className={`ml-1 h-4 w-4 text-slate-400 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.role === "admin"
                            ? "default"
                            : p.role === "leader"
                              ? "warning"
                              : "secondary"
                        }
                        className="capitalize"
                      >
                        {p.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.team}</TableCell>
                    <TableCell className="text-slate-500">
                      {p.phone_whatsapp || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={p.is_active}
                          onCheckedChange={(v) => toggleActive(p, v)}
                        />
                        <span className="text-xs text-slate-500">
                          {p.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {lastCheckIn ? formatRelative(lastCheckIn) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditing(p)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setResetting(p)}
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <AnimatePresence>
                    {isExpanded && (
                      <TableRow className="bg-slate-50/60">
                        <TableCell colSpan={7} className="p-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="grid gap-4 p-6 md:grid-cols-3">
                              <div>
                                <p className="text-xs text-slate-500">
                                  Days this month
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                  {records.length}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">
                                  Last check-in
                                </p>
                                <p className="text-sm font-medium text-slate-900">
                                  {lastCheckIn
                                    ? formatRelative(lastCheckIn)
                                    : "Never"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Created</p>
                                <p className="text-sm font-medium text-slate-900">
                                  {formatRelative(p.created_at)}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogSlideOver>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>
              Create a new account. The member will receive their credentials
              from you.
            </DialogDescription>
          </DialogHeader>
          <MemberForm
            initial={EMPTY_FORM}
            onSubmit={handleCreate}
            submitting={submitting}
            requirePassword
            submitLabel="Create Member"
          />
        </DialogSlideOver>
      </Dialog>

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
      >
        <DialogSlideOver>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update member details. To change the password, use Reset
              Password.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <MemberForm
              initial={{
                full_name: editing.full_name,
                email: "",
                password: "",
                username: editing.username,
                phone_whatsapp: editing.phone_whatsapp || "",
                role: editing.role,
                team: editing.team,
              }}
              onSubmit={handleEdit}
              submitting={submitting}
              requirePassword={false}
              hideEmail
              submitLabel="Save changes"
            />
          )}
        </DialogSlideOver>
      </Dialog>

      <Dialog
        open={Boolean(resetting)}
        onOpenChange={(o) => !o && setResetting(null)}
      >
        <DialogSlideOver>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {resetting?.full_name}.
            </DialogDescription>
          </DialogHeader>
          <PasswordForm
            onSubmit={handleResetPassword}
            submitting={submitting}
          />
        </DialogSlideOver>
      </Dialog>
    </div>
  );
}

interface MemberFormProps {
  initial: MemberFormValues;
  onSubmit: (values: MemberFormValues) => void;
  submitting: boolean;
  requirePassword: boolean;
  hideEmail?: boolean;
  submitLabel: string;
}

function MemberForm({
  initial,
  onSubmit,
  submitting,
  requirePassword,
  hideEmail,
  submitLabel,
}: MemberFormProps) {
  const [values, setValues] = useState(initial);

  function update<K extends keyof MemberFormValues>(
    key: K,
    value: MemberFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div className="grid gap-1.5">
        <Label>Full name</Label>
        <Input
          value={values.full_name}
          onChange={(e) => update("full_name", e.target.value)}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Username</Label>
        <Input
          value={values.username}
          onChange={(e) => update("username", e.target.value)}
          required
        />
      </div>
      {!hideEmail && (
        <div className="grid gap-1.5">
          <Label>Email</Label>
          <Input
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </div>
      )}
      {requirePassword && (
        <div className="grid gap-1.5">
          <Label>Password</Label>
          <Input
            type="password"
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            minLength={8}
            required
          />
        </div>
      )}
      <div className="grid gap-1.5">
        <Label>Phone (WhatsApp)</Label>
        <Input
          value={values.phone_whatsapp}
          onChange={(e) => update("phone_whatsapp", e.target.value)}
          placeholder="+2348012345678"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Role</Label>
          <Select
            value={values.role}
            onValueChange={(v) => update("role", v as Role)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="leader">Leader</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Team</Label>
          <Input
            value={values.team}
            onChange={(e) => update("team", e.target.value)}
            required
          />
        </div>
      </div>
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? <Spinner /> : <Plus className="h-4 w-4" />}
        {submitLabel}
      </Button>
    </form>
  );
}

function PasswordForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (v: { password: string }) => void;
  submitting: boolean;
}) {
  const [password, setPassword] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ password });
      }}
      className="mt-6 space-y-4"
    >
      <div className="grid gap-1.5">
        <Label>New password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? <Spinner /> : <KeyRound className="h-4 w-4" />}
        Reset Password
      </Button>
    </form>
  );
}
