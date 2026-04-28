"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  XCircle,
  Loader2,
  Users,
  CheckCircle,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { adminMarkPresentAction } from "@/lib/actions/admin";
import { QRScanner } from "@/components/attendance/QRScanner";
import { createClient } from "@/lib/supabase/client";
import { getInitials, formatDateISO } from "@/lib/utils";
import type { AttendanceWithProfile, Profile } from "@/types";

function methodPill(method: string) {
  const m = method.toLowerCase();
  if (m === "qr")
    return "rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-blue-800";
  if (m === "admin")
    return "rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-900";
  return "rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-700";
}

export function AttendancePanel({
  initialDate,
  members,
  initialAttendance,
}: {
  initialDate: string;
  members: Profile[];
  initialAttendance: AttendanceWithProfile[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [date, setDate] = useState(initialDate);
  const [attendance, setAttendance] =
    useState<AttendanceWithProfile[]>(initialAttendance);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const isToday = date === formatDateISO(new Date());

  useEffect(() => {
    if (!isToday) return;
    const channel = supabase
      .channel(`attendance-${date}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance" },
        () => {
          router.refresh();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, isToday]);

  useEffect(() => {
    setAttendance(initialAttendance);
  }, [initialAttendance]);

  const presentSet = useMemo(
    () => new Set(attendance.map((a) => a.user_id)),
    [attendance]
  );

  const presentMembers = useMemo(
    () =>
      attendance
        .slice()
        .sort((a, b) => b.checked_in_at.localeCompare(a.checked_in_at)),
    [attendance]
  );

  const absentMembers = useMemo(
    () => members.filter((m) => !presentSet.has(m.id)),
    [members, presentSet]
  );

  const filterFn = (text: string) =>
    !query || text.toLowerCase().includes(query.toLowerCase());

  const visiblePresent = presentMembers.filter((p) =>
    filterFn(p.profile.full_name)
  );
  const visibleAbsent = absentMembers.filter((m) => filterFn(m.full_name));

  const memberCount = members.length;
  const presentCount = attendance.length;
  const absentCount = Math.max(0, memberCount - presentCount);
  const rate =
    memberCount === 0 ? 0 : Math.round((presentCount / memberCount) * 1000) / 10;

  const onMarkPresent = (id: string) => {
    if (!isToday) {
      toast.error("Can only mark present for today");
      return;
    }
    startTransition(async () => {
      const res = await adminMarkPresentAction(id);
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("Marked present");
        router.refresh();
      }
    });
  };

  return (
    <div className="fade-up space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
            {format(parseISO(date), "EEEE, MMMM d, yyyy")}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Review who&apos;s in and mark absences for the selected date.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={date}
            max={formatDateISO(new Date())}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 w-auto rounded-xl border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500"
          />
          <Button
            type="button"
            onClick={() => router.push("/admin/reports")}
            className="rounded-xl bg-green-600 font-semibold text-white hover:bg-green-700 active:scale-[0.98]"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard title="Total" value={memberCount} icon={Users} color="blue" delay={0} fadeClass="fade-up-0" />
        <StatsCard title="Present" value={presentCount} icon={CheckCircle} color="green" delay={0.05} fadeClass="fade-up-1" />
        <StatsCard title="Absent" value={absentCount} icon={XCircle} color="red" delay={0.1} fadeClass="fade-up-2" />
        <StatsCard title="Rate" value={rate} suffix="%" icon={TrendingUp} color="amber" delay={0.15} fadeClass="fade-up-3" />
      </div>

      {isToday && (
        <QRScanner onRecorded={() => router.refresh()} />
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Search members..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 rounded-xl border-slate-300 pl-9 focus-visible:ring-2 focus-visible:ring-blue-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-slate-900">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Present
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">
              {presentCount}
            </span>
          </h3>
          <ul className="max-h-[480px] space-y-1 overflow-auto">
            <AnimatePresence initial={false}>
            {visiblePresent.length === 0 && (
                <li className="py-8 text-center text-sm text-slate-600">
                No check-ins yet.
              </li>
            )}
            {visiblePresent.map((a) => (
                <motion.li
                key={a.id}
                  layout
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between gap-2 rounded-xl px-2 py-2 transition hover:bg-slate-50"
              >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-9 w-9 border border-slate-100">
                    {a.profile.avatar_url && (
                      <AvatarImage src={a.profile.avatar_url} />
                    )}
                      <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
                      {getInitials(a.profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                      {a.profile.full_name}
                    </p>
                      <p className="truncate text-xs text-slate-600">
                        {a.profile.team}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="hidden text-xs text-slate-600 sm:inline">
                    {format(parseISO(a.checked_in_at), "h:mm a")}
                  </span>
                    <span className={methodPill(a.method)}>{a.method}</span>
                </div>
                </motion.li>
            ))}
            </AnimatePresence>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-slate-900">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Absent
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">
              {absentCount}
            </span>
          </h3>
          <ul className="max-h-[480px] space-y-1 overflow-auto">
            <AnimatePresence initial={false}>
            {visibleAbsent.length === 0 && (
                <li className="py-8 text-center text-sm text-slate-600">
                  Everyone&apos;s present.
              </li>
            )}
            {visibleAbsent.map((m) => (
                <motion.li
                key={m.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between gap-2 rounded-xl px-2 py-2 transition hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-9 w-9 border border-slate-100">
                    {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                      <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
                        {getInitials(m.full_name)}
                      </AvatarFallback>
                  </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                      {m.full_name}
                    </p>
                      <p className="truncate text-xs text-slate-600">{m.team}</p>
                    </div>
                </div>
                {isToday && (
                    <button
                      type="button"
                    onClick={() => onMarkPresent(m.id)}
                    disabled={pending}
                      className="shrink-0 rounded-lg border-2 border-green-600 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-50 active:scale-[0.98] disabled:opacity-50"
                    >
                      {pending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Mark Present"
                      )}
                    </button>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </div>
  );
}
