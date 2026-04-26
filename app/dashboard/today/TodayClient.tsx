"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Send,
  Users as UsersIcon,
  XCircle,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import StatsCard from "@/components/StatsCard";
import { createClient } from "@/lib/supabase/client";
import { formatTime, getInitials, todayISO } from "@/lib/utils";
import type { AttendanceWithProfile, Profile } from "@/types";

interface Props {
  profile: Profile;
  allProfiles: Profile[];
  initialAttendance: AttendanceWithProfile[];
}

export default function TodayClient({
  profile,
  allProfiles,
  initialAttendance,
}: Props) {
  const [attendance, setAttendance] =
    useState<AttendanceWithProfile[]>(initialAttendance);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [sendingSummary, setSendingSummary] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("today-attendance")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "attendance",
          filter: `date=eq.${todayISO()}`,
        },
        async (payload) => {
          const userId = (payload.new as { user_id: string }).user_id;
          const { data } = await supabase
            .from("profiles")
            .select(
              "id, full_name, username, team, avatar_url, phone_whatsapp, role"
            )
            .eq("id", userId)
            .single();
          const newRow = {
            ...(payload.new as AttendanceWithProfile),
            profile: data || undefined,
          } as AttendanceWithProfile;
          setAttendance((prev) => {
            if (prev.some((p) => p.id === newRow.id)) return prev;
            const teamFilter = profile.role === "leader" ? profile.team : null;
            if (teamFilter && newRow.profile?.team !== teamFilter) return prev;
            return [...prev, newRow];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.role, profile.team]);

  const presentIds = useMemo(
    () => new Set(attendance.map((a) => a.user_id)),
    [attendance]
  );
  const presentList = useMemo(
    () =>
      attendance
        .slice()
        .sort((a, b) =>
          a.checked_in_at < b.checked_in_at ? -1 : 1
        ),
    [attendance]
  );
  const absentList = useMemo(
    () =>
      allProfiles.filter((p) => p.is_active && !presentIds.has(p.id)),
    [allProfiles, presentIds]
  );

  const total = allProfiles.filter((p) => p.is_active).length;
  const presentCount = presentList.length;
  const absentCount = Math.max(0, total - presentCount);
  const rate = total === 0 ? 0 : Math.round((presentCount / total) * 100);

  async function markPresent(userId: string) {
    setMarkingId(userId);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("attendance")
      .insert({
        user_id: userId,
        date: todayISO(),
        method: "admin",
        marked_by: profile.id,
      })
      .select(
        `*, profile:profiles!attendance_user_id_fkey(id, full_name, username, team, avatar_url, phone_whatsapp, role)`
      )
      .single();
    setMarkingId(null);
    if (error) {
      toast.error("Could not mark present.");
      return;
    }
    if (data) {
      setAttendance((prev) => [...prev, data as AttendanceWithProfile]);
      toast.success("Marked as present");
    }
  }

  async function sendSummary() {
    setSendingSummary(true);
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "summary" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      toast.success(`Summary sent to ${data.delivered ?? 0} recipients`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send";
      toast.error(message);
    } finally {
      setSendingSummary(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {profile.role === "leader"
            ? `Showing your team: ${profile.team}`
            : "Real-time attendance for today"}
        </p>
        {profile.role === "admin" && (
          <Button onClick={sendSummary} disabled={sendingSummary}>
            {sendingSummary ? <Spinner /> : <Send className="h-4 w-4" />}
            Send Summary
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total members"
          value={total}
          icon={UsersIcon}
          tone="default"
          delay={0.05}
        />
        <StatsCard
          label="Present"
          value={presentCount}
          icon={CheckCircle2}
          tone="success"
          delay={0.1}
        />
        <StatsCard
          label="Absent"
          value={absentCount}
          icon={XCircle}
          tone="danger"
          delay={0.15}
        />
        <StatsCard
          label="Attendance rate"
          value={`${rate}%`}
          icon={Percent}
          tone={rate >= 70 ? "success" : rate >= 40 ? "warning" : "danger"}
          delay={0.2}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              Present ({presentCount})
            </h3>
            <Badge variant="success">Live</Badge>
          </div>
          <div className="space-y-2">
            {presentList.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                No one has checked in yet.
              </p>
            )}
            {presentList.map((row, i) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.02 }}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-success-500" />
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {getInitials(row.profile?.full_name ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {row.profile?.full_name ?? "Unknown"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {row.profile?.team}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-700">
                    {formatTime(row.checked_in_at)}
                  </p>
                  <Badge
                    variant={
                      row.method === "qr"
                        ? "success"
                        : row.method === "admin"
                          ? "warning"
                          : "default"
                    }
                    className="mt-1 capitalize"
                  >
                    {row.method}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              Absent ({absentCount})
            </h3>
          </div>
          <div className="space-y-2">
            {absentList.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                Everyone is present today!
              </p>
            )}
            {absentList.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.02 }}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-danger-500" />
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{getInitials(p.full_name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {p.full_name}
                  </p>
                  <p className="text-xs text-slate-500">{p.team}</p>
                </div>
                {profile.role === "admin" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markPresent(p.id)}
                    disabled={markingId === p.id}
                  >
                    {markingId === p.id ? <Spinner /> : "Mark Present"}
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
