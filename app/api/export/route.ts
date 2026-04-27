import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { format, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import {
  getAttendanceInRange,
  getRangeReport,
} from "@/lib/queries/attendance";
import { NEOLIFE_STATUS_LABELS } from "@/types";
import { formatDateISO } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const from = url.searchParams.get("from") ?? formatDateISO(new Date());
  const to = url.searchParams.get("to") ?? formatDateISO(new Date());

  const [report, raw] = await Promise.all([
    getRangeReport(from, to),
    getAttendanceInRange(from, to),
  ]);

  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryHeader: (string | number)[][] = [
    ["Support Office — Attendance Report"],
    [`From: ${from}`, `To: ${to}`],
    [],
    [
      "Members",
      "Total Present",
      "Total Absent",
      "Avg Rate %",
    ],
    [
      report.length,
      report.reduce((s, r) => s + r.presentDays, 0),
      report.reduce((s, r) => s + r.absentDays, 0),
      report.length === 0
        ? 0
        : Math.round((report.reduce((s, r) => s + r.rate, 0) / report.length) * 10) /
          10,
    ],
    [],
    [
      "Name",
      "Sponsor",
      "Upline",
      "Status",
      "Team",
      "Days Present",
      "Days Absent",
      "Rate %",
      "Best Streak",
      "Last Check-In",
    ],
  ];

  for (const r of report) {
    summaryHeader.push([
      r.profile.full_name,
      r.profile.sponsor_name,
      r.profile.upline_name,
      NEOLIFE_STATUS_LABELS[r.profile.status],
      r.profile.team,
      r.presentDays,
      r.absentDays,
      r.rate,
      r.bestStreak,
      r.lastCheckIn ? format(parseISO(r.lastCheckIn), "yyyy-MM-dd HH:mm") : "—",
    ]);
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryHeader);

  // Apply colour to rate column (col index 7) — green/amber/red
  const headerRowIndex = 6; // 0-indexed row of column headers
  for (let i = 0; i < report.length; i++) {
    const r = report[i];
    const rowIdx = headerRowIndex + 1 + i;
    const cellAddr = XLSX.utils.encode_cell({ c: 7, r: rowIdx });
    const fg =
      r.rate >= 70 ? "FF059669" : r.rate >= 40 ? "FFD97706" : "FFDC2626";
    if (summarySheet[cellAddr]) {
      summarySheet[cellAddr].s = {
        font: { color: { rgb: fg.slice(2) }, bold: true },
      };
    }
  }

  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  // Sheet 2: Raw Data
  const rawRows: (string | number)[][] = [
    ["Name", "Date", "Day", "Time", "Method", "Marked By"],
  ];
  for (const a of raw) {
    rawRows.push([
      a.profile.full_name,
      a.date,
      format(parseISO(a.date), "EEEE"),
      format(parseISO(a.checked_in_at), "HH:mm:ss"),
      a.method,
      a.marked_by ?? "self",
    ]);
  }
  const rawSheet = XLSX.utils.aoa_to_sheet(rawRows);
  XLSX.utils.book_append_sheet(wb, rawSheet, "Raw Data");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const body = new Uint8Array(buf);

  return new NextResponse(body, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="support-office-attendance-${from}-to-${to}.xlsx"`,
    },
  });
}
