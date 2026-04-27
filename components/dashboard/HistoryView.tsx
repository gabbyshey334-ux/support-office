"use client";

import { useMemo, useState } from "react";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isAfter, startOfDay, subMonths } from "date-fns";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CheckCircle, XCircle, Percent } from "lucide-react";
import type { AttendanceRecord } from "@/types";

export function HistoryView({
  records,
  joinedAt,
  fullName,
}: {
  records: AttendanceRecord[];
  joinedAt: string;
  fullName: string;
}) {
  const months = useMemo(() => {
    const list: { value: string; label: string }[] = [];
    const start = startOfMonth(new Date(joinedAt));
    let cursor = startOfMonth(new Date());
    while (cursor >= start) {
      list.push({
        value: format(cursor, "yyyy-MM"),
        label: format(cursor, "MMMM yyyy"),
      });
      cursor = subMonths(cursor, 1);
    }
    return list;
  }, [joinedAt]);

  const [selected, setSelected] = useState(months[0]?.value ?? format(new Date(), "yyyy-MM"));

  const monthDate = useMemo(() => {
    const [y, m] = selected.split("-").map(Number);
    return new Date(y, m - 1, 1);
  }, [selected]);

  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  const today = startOfDay(new Date());
  const days = eachDayOfInterval({ start, end }).filter(
    (d) => !isAfter(d, today)
  );
  const presentSet = new Set(records.map((r) => r.date));
  const monthRecords = days.map((d) => {
    const iso = format(d, "yyyy-MM-dd");
    const r = records.find((x) => x.date === iso);
    return { date: d, record: r };
  });

  const presentCount = monthRecords.filter((d) => d.record).length;
  const absentCount = monthRecords.length - presentCount;
  const rate =
    monthRecords.length === 0
      ? 0
      : Math.round((presentCount / monthRecords.length) * 1000) / 10;

  const exportCSV = () => {
    const rows = [
      ["Date", "Day", "Status", "Time", "Method"],
      ...monthRecords
        .slice()
        .reverse()
        .map(({ date, record }) => [
          format(date, "yyyy-MM-dd"),
          format(date, "EEEE"),
          record ? "Present" : "Absent",
          record ? format(parseISO(record.checked_in_at), "h:mm a") : "—",
          record ? record.method : "—",
        ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fullName.replace(/\s+/g, "-").toLowerCase()}-attendance-${selected}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fade-up space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
            My History
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Your full attendance log, month by month.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="h-10 w-[180px] rounded-xl border-slate-300 focus:ring-2 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={exportCSV}
            className="h-10 rounded-xl border-slate-300 font-semibold hover:bg-slate-50"
          >
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatsCard
          title="Present"
          value={presentCount}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Absent"
          value={absentCount}
          icon={XCircle}
          color="red"
        />
        <StatsCard title="Rate" value={rate} suffix="%" icon={Percent} color="blue" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 bg-slate-50 hover:bg-slate-50">
              <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Date
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Day
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Status
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Time
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Method
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthRecords
              .slice()
              .reverse()
              .map(({ date, record }) => {
                const iso = format(date, "yyyy-MM-dd");
                const present = presentSet.has(iso);
                return (
                  <TableRow key={iso}>
                    <TableCell className="font-medium">
                      {format(date, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{format(date, "EEEE")}</TableCell>
                    <TableCell>
                      {present ? (
                        <Badge variant="approved">Present</Badge>
                      ) : (
                        <Badge variant="rejected">Absent</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {record
                        ? format(parseISO(record.checked_in_at), "h:mm a")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {record ? (
                        <Badge variant="blue" className="uppercase">
                          {record.method}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
