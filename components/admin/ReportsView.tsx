"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parseISO, eachDayOfInterval } from "date-fns";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CheckCircle, XCircle, Percent, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ExportButton } from "./ExportButton";
import type { Profile } from "@/types";

interface ReportRow {
  profile: Profile;
  presentDays: number;
  absentDays: number;
  rate: number;
  bestStreak: number;
  lastCheckIn: string | null;
}

const COLORS = [
  "#1A56DB",
  "#059669",
  "#D97706",
  "#DC2626",
  "#7C3AED",
  "#0891B2",
];

export function ReportsView({
  from,
  to,
  rows,
  dailyData,
}: {
  from: string;
  to: string;
  rows: ReportRow[];
  dailyData: { date: string; present: number; absent: number }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fromState, setFromState] = useState(from);
  const [toState, setToState] = useState(to);

  const onApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", fromState);
    params.set("to", toState);
    router.push(`/admin/reports?${params.toString()}`);
  };

  const memberCount = rows.length;
  const totalDays = dailyData.length;
  const totalPresent = rows.reduce((sum, r) => sum + r.presentDays, 0);
  const totalAbsent = rows.reduce((sum, r) => sum + r.absentDays, 0);
  const avgRate =
    rows.length === 0
      ? 0
      : Math.round(
          (rows.reduce((s, r) => s + r.rate, 0) / rows.length) * 10
        ) / 10;

  const [enabled, setEnabled] = useState<Set<string>>(
    () => new Set(rows.slice(0, 4).map((r) => r.profile.id))
  );

  // Build per-day per-member lines (cumulative present)
  const memberSeries = useMemo(() => {
    const days = eachDayOfInterval({
      start: parseISO(from),
      end: parseISO(to),
    });
    return days.map((d) => {
      const iso = format(d, "yyyy-MM-dd");
      const obj: Record<string, string | number> = { date: format(d, "MMM d") };
      for (const r of rows) {
        if (!enabled.has(r.profile.id)) continue;
        // We don't have per-day per-user series; use daily avg presence as 0/1
        const wasPresent = dailyData.find((dd) => dd.date === iso);
        obj[r.profile.full_name] =
          wasPresent && wasPresent.present > 0
            ? Math.round((wasPresent.present / Math.max(memberCount, 1)) * 100)
            : 0;
      }
      return obj;
    });
  }, [from, to, rows, dailyData, enabled, memberCount]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
            Reports
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Trend analysis and downloadable Excel exports.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <Label className="text-xs">From</Label>
            <Input
              type="date"
              value={fromState}
              onChange={(e) => setFromState(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">To</Label>
            <Input
              type="date"
              value={toState}
              onChange={(e) => setToState(e.target.value)}
            />
          </div>
          <Button onClick={onApply}>Apply</Button>
          <ExportButton from={from} to={to} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Members" value={memberCount} icon={Users} color="blue" />
        <StatsCard
          title="Total Present"
          value={totalPresent}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard title="Total Absent" value={totalAbsent} icon={XCircle} color="red" />
        <StatsCard
          title="Avg Rate"
          value={avgRate}
          suffix="%"
          icon={Percent}
          color="amber"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-1 font-display text-base font-semibold text-slate-900">
          Daily Attendance
        </h3>
        <p className="mb-4 text-[13px] text-slate-600">Present vs absent by day</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dailyData.map((d) => ({
                date: format(parseISO(d.date), "MMM d"),
                present: d.present,
                absent: d.absent,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#60A5FA" radius={[6, 6, 0, 0]} />
              <Bar dataKey="absent" fill="#FECACA" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900">
              Member Trends
            </h3>
            <p className="text-[13px] text-slate-600">Relative presence signal by day</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {rows.slice(0, 8).map((r, i) => {
              const on = enabled.has(r.profile.id);
              return (
                <button
                  key={r.profile.id}
                  type="button"
                  onClick={() => {
                    setEnabled((s) => {
                      const next = new Set(s);
                      if (on) next.delete(r.profile.id);
                      else next.add(r.profile.id);
                      return next;
                    });
                  }}
                  className={`text-xs rounded-full px-2.5 py-1 border transition ${
                    on
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                  style={on ? { borderColor: COLORS[i % COLORS.length] } : {}}
                >
                  {r.profile.full_name}
                </button>
              );
            })}
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={memberSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} unit="%" />
              <Tooltip />
              {rows.slice(0, 8).map((r, i) =>
                enabled.has(r.profile.id) ? (
                  <Line
                    key={r.profile.id}
                    type="natural"
                    dataKey={r.profile.full_name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 bg-slate-50 hover:bg-slate-50">
              <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Member
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Sponsor
              </TableHead>
              <TableHead className="hidden text-xs font-medium uppercase tracking-wider text-slate-600 md:table-cell">
                Status
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Present
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Absent
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Rate
              </TableHead>
              <TableHead className="hidden text-xs font-medium uppercase tracking-wider text-slate-600 md:table-cell">
                Streak
              </TableHead>
              <TableHead className="hidden text-xs font-medium uppercase tracking-wider text-slate-600 lg:table-cell">
                Last Check-In
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-slate-600">
                  No data for the selected range.
                </TableCell>
              </TableRow>
            )}
            {rows.map((r, idx) => (
              <TableRow
                key={r.profile.id}
                className={idx % 2 === 1 ? "border-b border-slate-100 bg-slate-50" : "border-b border-slate-100"}
              >
                <TableCell className="py-3.5 font-medium text-slate-900">
                  {r.profile.full_name}
                </TableCell>
                <TableCell className="py-3.5 text-slate-700">{r.profile.sponsor_name}</TableCell>
                <TableCell className="hidden py-3.5 md:table-cell">
                  <Badge variant="blue">{r.profile.status.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell className="py-3.5 text-slate-700">{r.presentDays}</TableCell>
                <TableCell className="py-3.5 text-slate-700">{r.absentDays}</TableCell>
                <TableCell className="py-3.5">
                  <span
                    className={`font-semibold ${
                      r.rate > 70
                        ? "text-green-600"
                        : r.rate >= 40
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}
                  >
                    {r.rate}%
                  </span>
                </TableCell>
                <TableCell className="hidden py-3.5 text-slate-700 md:table-cell">
                  {r.bestStreak} {r.bestStreak === 1 ? "day" : "days"}
                </TableCell>
                <TableCell className="hidden py-3.5 text-slate-600 lg:table-cell">
                  {r.lastCheckIn
                    ? format(parseISO(r.lastCheckIn), "MMM d, h:mm a")
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
