"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { dayName, formatDate, formatTime } from "@/lib/utils";
import type { Attendance, AttendanceMethod, AttendanceWithProfile } from "@/types";

type Row = Attendance | AttendanceWithProfile;

interface AttendanceTableProps {
  rows: Row[];
  showMember?: boolean;
  emptyMessage?: string;
}

function methodVariant(
  method: AttendanceMethod
): "success" | "warning" | "default" {
  if (method === "qr") return "success";
  if (method === "admin") return "warning";
  return "default";
}

export default function AttendanceTable({
  rows,
  showMember = false,
  emptyMessage = "No attendance records found.",
}: AttendanceTableProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => {
      const profileName =
        ("profile" in r && r.profile?.full_name) || "";
      return (
        r.date.includes(q) ||
        r.method.includes(q) ||
        profileName.toLowerCase().includes(q)
      );
    });
  }, [rows, query]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-4">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records…"
            className="pl-9"
          />
        </div>
        <p className="text-xs text-slate-500">
          {filtered.length} record{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {showMember && <TableHead>Member</TableHead>}
            <TableHead>Date</TableHead>
            <TableHead>Day</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={showMember ? 6 : 5}
                className="py-12 text-center text-sm text-slate-500"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((row) => (
              <TableRow key={row.id}>
                {showMember && (
                  <TableCell className="font-medium text-slate-900">
                    {("profile" in row && row.profile?.full_name) || "—"}
                  </TableCell>
                )}
                <TableCell>{formatDate(row.date, "dd MMM yyyy")}</TableCell>
                <TableCell className="text-slate-500">
                  {dayName(row.date)}
                </TableCell>
                <TableCell>{formatTime(row.checked_in_at)}</TableCell>
                <TableCell>
                  <Badge variant={methodVariant(row.method)} className="capitalize">
                    {row.method}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="success">Present</Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
