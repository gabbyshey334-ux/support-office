import type { SupabaseClient } from "@supabase/supabase-js";
import { differenceInCalendarDays, parseISO, startOfMonth, startOfWeek } from "date-fns";
import type {
  Attendance,
  AttendanceMethod,
  AttendanceStats,
  AttendanceWithProfile,
  Profile,
} from "@/types";
import { todayISO } from "@/lib/utils";

const PROFILE_FIELDS =
  "id, full_name, username, team, avatar_url, phone_whatsapp, role";

export async function getTodayAttendance(
  supabase: SupabaseClient,
  team?: string
): Promise<AttendanceWithProfile[]> {
  let query = supabase
    .from("attendance")
    .select(`*, profile:profiles!attendance_user_id_fkey(${PROFILE_FIELDS})`)
    .eq("date", todayISO())
    .order("checked_in_at", { ascending: true });
  const { data, error } = await query;
  if (error) throw error;
  let rows = (data || []) as AttendanceWithProfile[];
  if (team) rows = rows.filter((r) => r.profile?.team === team);
  return rows;
}

export async function getOwnAttendance(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 60
): Promise<Attendance[]> {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as Attendance[];
}

export async function getAttendanceInRange(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
): Promise<AttendanceWithProfile[]> {
  const { data, error } = await supabase
    .from("attendance")
    .select(`*, profile:profiles!attendance_user_id_fkey(${PROFILE_FIELDS})`)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });
  if (error) throw error;
  return (data || []) as AttendanceWithProfile[];
}

export async function checkInUser(
  supabase: SupabaseClient,
  params: { userId: string; method: AttendanceMethod; markedBy?: string }
): Promise<{ inserted: boolean; row: Attendance | null; existing: Attendance | null }> {
  const today = todayISO();

  const { data: existing } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", params.userId)
    .eq("date", today)
    .maybeSingle();

  if (existing) {
    return { inserted: false, row: null, existing: existing as Attendance };
  }

  const { data, error } = await supabase
    .from("attendance")
    .insert({
      user_id: params.userId,
      date: today,
      method: params.method,
      marked_by: params.markedBy ?? params.userId,
    })
    .select()
    .single();
  if (error) throw error;
  return { inserted: true, row: data as Attendance, existing: null };
}

export function computeStats(rows: Attendance[]): AttendanceStats {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  let thisWeek = 0;
  let thisMonth = 0;
  for (const r of rows) {
    const d = parseISO(r.date);
    if (d >= weekStart) thisWeek += 1;
    if (d >= monthStart) thisMonth += 1;
  }

  const sortedDates = [...rows]
    .map((r) => r.date)
    .sort((a, b) => (a < b ? 1 : -1));

  let currentStreak = 0;
  let cursor = new Date();
  for (const dateStr of sortedDates) {
    const d = parseISO(dateStr);
    const diff = differenceInCalendarDays(cursor, d);
    if (diff === 0 || (currentStreak === 0 && diff === 1)) {
      currentStreak += 1;
      cursor = d;
    } else if (diff === 1) {
      currentStreak += 1;
      cursor = d;
    } else {
      break;
    }
  }

  return {
    thisWeek,
    thisMonth,
    currentStreak,
    totalDays: rows.length,
  };
}

export interface MemberSummaryRow {
  profile: Profile;
  daysPresent: number;
  daysAbsent: number;
  attendanceRate: number;
  streak: number;
  lastCheckIn: string | null;
}

export function buildMemberSummaries(
  profiles: Profile[],
  attendance: AttendanceWithProfile[],
  totalDays: number
): MemberSummaryRow[] {
  const byUser = new Map<string, AttendanceWithProfile[]>();
  for (const row of attendance) {
    if (!row.user_id) continue;
    const list = byUser.get(row.user_id) || [];
    list.push(row);
    byUser.set(row.user_id, list);
  }

  return profiles.map((p) => {
    const rows = (byUser.get(p.id) || []).sort((a, b) =>
      a.date < b.date ? 1 : -1
    );
    const daysPresent = rows.length;
    const daysAbsent = Math.max(0, totalDays - daysPresent);
    const attendanceRate =
      totalDays === 0 ? 0 : Math.round((daysPresent / totalDays) * 100);

    let streak = 0;
    let cursor = new Date();
    for (const r of rows) {
      const d = parseISO(r.date);
      const diff = differenceInCalendarDays(cursor, d);
      if (diff === 0 || (streak === 0 && diff === 1) || diff === 1) {
        streak += 1;
        cursor = d;
      } else {
        break;
      }
    }

    return {
      profile: p,
      daysPresent,
      daysAbsent,
      attendanceRate,
      streak,
      lastCheckIn: rows[0]?.checked_in_at ?? null,
    };
  });
}
