import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, listProfiles } from "@/lib/queries/profiles";
import { getAttendanceInRange, buildMemberSummaries } from "@/lib/queries/attendance";
import { dateRangeSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const supabase = createClient();
  const me = await getCurrentProfile(supabase);
  if (!me) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (me.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const url = new URL(request.url);
  const startDate = url.searchParams.get("startDate") ?? "";
  const endDate = url.searchParams.get("endDate") ?? "";
  const parsed = dateRangeSchema.safeParse({ startDate, endDate });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid date range. Use YYYY-MM-DD." },
      { status: 400 }
    );
  }

  const totalDays =
    differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1;
  if (totalDays < 1) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  const [profiles, attendance] = await Promise.all([
    listProfiles(supabase, { activeOnly: true }),
    getAttendanceInRange(supabase, startDate, endDate),
  ]);

  const summaries = buildMemberSummaries(profiles, attendance, totalDays);

  const wb = XLSX.utils.book_new();

  const summaryRows: (string | number)[][] = [];
  summaryRows.push(["Support Office Attendance Report"]);
  summaryRows.push([
    `Date range: ${format(parseISO(startDate), "PP")} – ${format(
      parseISO(endDate),
      "PP"
    )}`,
  ]);
  summaryRows.push([`Generated: ${format(new Date(), "PP p")}`]);
  summaryRows.push([]);
  summaryRows.push([
    "Total members",
    "Total days",
    "Total check-ins",
    "Avg attendance / day",
  ]);
  summaryRows.push([
    profiles.length,
    totalDays,
    attendance.length,
    Math.round(attendance.length / Math.max(totalDays, 1)),
  ]);
  summaryRows.push([]);
  summaryRows.push([
    "Member",
    "Username",
    "Team",
    "Role",
    "Days present",
    "Days absent",
    "Attendance %",
    "Streak",
    "Last check-in",
  ]);
  for (const s of summaries) {
    summaryRows.push([
      s.profile.full_name,
      s.profile.username,
      s.profile.team,
      s.profile.role,
      s.daysPresent,
      s.daysAbsent,
      s.attendanceRate,
      s.streak,
      s.lastCheckIn ? format(parseISO(s.lastCheckIn), "yyyy-MM-dd HH:mm") : "—",
    ]);
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);

  // Styling: title row, header row formatting and conditional cells.
  const titleCell = summarySheet["A1"];
  if (titleCell) {
    titleCell.s = {
      font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
      fill: { patternType: "solid", fgColor: { rgb: "1A56DB" } },
      alignment: { horizontal: "left", vertical: "center" },
    };
  }
  const headerRowIdx = 7;
  const headers = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
  ];
  for (const col of headers) {
    const cell = summarySheet[`${col}${headerRowIdx + 1}`];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: "0F172A" } },
        fill: { patternType: "solid", fgColor: { rgb: "E2E8F0" } },
        alignment: { horizontal: "left" },
      };
    }
  }
  for (let i = 0; i < summaries.length; i += 1) {
    const rowIdx = headerRowIdx + 2 + i;
    const rate = summaries[i].attendanceRate;
    const fillColor =
      rate > 70 ? "D1FAE5" : rate >= 40 ? "FEF3C7" : "FEE2E2";
    const textColor =
      rate > 70 ? "047857" : rate >= 40 ? "B45309" : "B91C1C";
    const cell = summarySheet[`G${rowIdx}`];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: textColor } },
        fill: { patternType: "solid", fgColor: { rgb: fillColor } },
        alignment: { horizontal: "center" },
      };
    }
  }
  summarySheet["!cols"] = [
    { wch: 28 },
    { wch: 18 },
    { wch: 16 },
    { wch: 10 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 10 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  // Raw data sheet.
  const rawRows: (string | number)[][] = [
    ["Member", "Username", "Team", "Date", "Time", "Method"],
  ];
  for (const r of attendance) {
    rawRows.push([
      r.profile?.full_name || "",
      r.profile?.username || "",
      r.profile?.team || "",
      r.date,
      format(parseISO(r.checked_in_at), "HH:mm"),
      r.method,
    ]);
  }
  const rawSheet = XLSX.utils.aoa_to_sheet(rawRows);
  rawSheet["!cols"] = [
    { wch: 28 },
    { wch: 18 },
    { wch: 16 },
    { wch: 12 },
    { wch: 8 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, rawSheet, "Raw Data");

  const buffer = XLSX.write(wb, {
    type: "buffer",
    bookType: "xlsx",
    cellStyles: true,
  }) as Buffer;

  const filename = `attendance-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=${filename}`,
      "Cache-Control": "no-store",
    },
  });
}
