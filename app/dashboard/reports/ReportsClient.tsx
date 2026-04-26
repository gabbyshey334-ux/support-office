"use client";

import { useEffect, useMemo, useState } from "react";
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  parseISO,
} from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Calendar,
  Award,
  TrendingDown,
  Users as UsersIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
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
import StatsCard from "@/components/StatsCard";
import ExportButton from "@/components/ExportButton";
import { buildMemberSummaries } from "@/lib/queries/attendance";
import { createClient } from "@/lib/supabase/client";
import { rateColor } from "@/lib/utils";
import type { AttendanceWithProfile, Profile } from "@/types";

interface Props {
  initialStart: string;
  initialEnd: string;
  initialProfiles: Profile[];
  initialAttendance: AttendanceWithProfile[];
}

const PROFILE_FIELDS =
  "id, full_name, username, team, avatar_url, phone_whatsapp, role";

export default function ReportsClient({
  initialStart,
  initialEnd,
  initialProfiles,
  initialAttendance,
}: Props) {
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [profiles] = useState<Profile[]>(initialProfiles);
  const [attendance, setAttendance] =
    useState<AttendanceWithProfile[]>(initialAttendance);
  const [loading, setLoading] = useState(false);
  const [memberFocusId, setMemberFocusId] = useState<string>(
    initialProfiles[0]?.id ?? ""
  );

  useEffect(() => {
    if (start === initialStart && end === initialEnd) return;
    const supabase = createClient();
    setLoading(true);
    supabase
      .from("attendance")
      .select(`*, profile:profiles!attendance_user_id_fkey(${PROFILE_FIELDS})`)
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true })
      .then(({ data }) => {
        setAttendance((data || []) as AttendanceWithProfile[]);
        setLoading(false);
      });
  }, [start, end, initialStart, initialEnd]);

  const totalDays = differenceInCalendarDays(parseISO(end), parseISO(start)) + 1;

  const dailyCounts = useMemo(() => {
    const days = eachDayOfInterval({ start: parseISO(start), end: parseISO(end) });
    const map = new Map<string, number>();
    for (const r of attendance) {
      map.set(r.date, (map.get(r.date) || 0) + 1);
    }
    return days.map((d) => {
      const key = format(d, "yyyy-MM-dd");
      return {
        date: format(d, "MMM d"),
        rawDate: key,
        present: map.get(key) || 0,
      };
    });
  }, [attendance, start, end]);

  const summaries = useMemo(
    () => buildMemberSummaries(profiles, attendance, totalDays),
    [profiles, attendance, totalDays]
  );

  const avgDailyAttendance = useMemo(() => {
    if (dailyCounts.length === 0) return 0;
    const sum = dailyCounts.reduce((acc, d) => acc + d.present, 0);
    return Math.round(sum / dailyCounts.length);
  }, [dailyCounts]);

  const bestDay = useMemo(() => {
    if (dailyCounts.length === 0) return null;
    return dailyCounts.reduce((acc, d) => (d.present > acc.present ? d : acc));
  }, [dailyCounts]);
  const worstDay = useMemo(() => {
    if (dailyCounts.length === 0) return null;
    return dailyCounts.reduce((acc, d) => (d.present < acc.present ? d : acc));
  }, [dailyCounts]);

  const memberTrend = useMemo(() => {
    if (!memberFocusId) return [];
    const days = eachDayOfInterval({ start: parseISO(start), end: parseISO(end) });
    const memberRows = attendance.filter((a) => a.user_id === memberFocusId);
    const set = new Set(memberRows.map((r) => r.date));
    return days.map((d) => {
      const key = format(d, "yyyy-MM-dd");
      return {
        date: format(d, "MMM d"),
        present: set.has(key) ? 1 : 0,
      };
    });
  }, [attendance, memberFocusId, start, end]);

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            <div className="grid gap-1.5">
              <Label>Start date</Label>
              <Input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>End date</Label>
              <Input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {loading && <Spinner />}
            <ExportButton startDate={start} endDate={end} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Days in range"
          value={totalDays}
          icon={Calendar}
          tone="default"
          delay={0.05}
        />
        <StatsCard
          label="Avg daily attendance"
          value={avgDailyAttendance}
          hint="members per day"
          icon={UsersIcon}
          tone="default"
          delay={0.1}
        />
        <StatsCard
          label="Best day"
          value={bestDay ? `${bestDay.present}` : "—"}
          hint={bestDay ? bestDay.date : ""}
          icon={Award}
          tone="success"
          delay={0.15}
        />
        <StatsCard
          label="Worst day"
          value={worstDay ? `${worstDay.present}` : "—"}
          hint={worstDay ? worstDay.date : ""}
          icon={TrendingDown}
          tone="danger"
          delay={0.2}
        />
      </div>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-slate-900">
          Daily attendance count
        </h3>
        <div className="mt-4 h-72 w-full">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="present" fill="#1A56DB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">
            Individual member trend
          </h3>
          <Select value={memberFocusId} onValueChange={setMemberFocusId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Choose a member" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4 h-72 w-full">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memberTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  domain={[0, 1]}
                  ticks={[0, 1]}
                  tickFormatter={(v) => (v === 1 ? "Present" : "Absent")}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ fill: "#059669", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-900">
            Member breakdown
          </h3>
          <p className="text-xs text-slate-500">
            Days present, days absent, attendance rate, and current streak.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Days present</TableHead>
              <TableHead>Days absent</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Streak</TableHead>
              <TableHead>Last check-in</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaries.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-slate-500">
                  No data for this range.
                </TableCell>
              </TableRow>
            )}
            {summaries.map((s) => (
              <TableRow key={s.profile.id}>
                <TableCell className="font-medium text-slate-900">
                  {s.profile.full_name}
                </TableCell>
                <TableCell>{s.profile.team}</TableCell>
                <TableCell>{s.daysPresent}</TableCell>
                <TableCell>{s.daysAbsent}</TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${rateColor(
                      s.attendanceRate
                    )}`}
                  >
                    {s.attendanceRate}%
                  </span>
                </TableCell>
                <TableCell>{s.streak}d</TableCell>
                <TableCell className="text-xs text-slate-500">
                  {s.lastCheckIn
                    ? format(parseISO(s.lastCheckIn), "dd MMM, h:mm a")
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

    </div>
  );
}
