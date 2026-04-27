import "server-only";
import { createClient } from "@/lib/supabase/server";
import { formatDateISO, calculateStreak } from "@/lib/utils";
import type {
  AttendanceRecord,
  AttendanceWithProfile,
  MemberStats,
  Profile,
} from "@/types";

type ProfileEmbed = Pick<Profile, "id" | "full_name" | "avatar_url" | "team">;

async function attachProfilesToAttendance(
  supabase: ReturnType<typeof createClient>,
  rows: AttendanceRecord[] | null
): Promise<AttendanceWithProfile[]> {
  if (!rows?.length) return [];
  const ids = [...new Set(rows.map((r) => r.user_id))];
  const { data: profs, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, team")
    .in("id", ids);
  if (error) {
    console.error("[attachProfilesToAttendance]", error.message);
  }
  const pmap = new Map<string, ProfileEmbed>(
    (profs ?? []).map((p) => [
      p.id,
      {
        id: p.id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        team: p.team,
      },
    ])
  );
  return rows.map((r) => ({
    ...r,
    profile:
      pmap.get(r.user_id) ?? {
        id: r.user_id,
        full_name: "Member",
        avatar_url: null,
        team: "",
      },
  }));
}

export async function getTodayAttendanceForUser(
  userId: string
): Promise<AttendanceRecord | null> {
  const supabase = createClient();
  const today = formatDateISO(new Date());
  const { data } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();
  return (data as AttendanceRecord) ?? null;
}

export async function getUserAttendanceHistory(
  userId: string,
  fromDate?: string,
  toDate?: string
): Promise<AttendanceRecord[]> {
  const supabase = createClient();
  let q = supabase
    .from("attendance")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (fromDate) q = q.gte("date", fromDate);
  if (toDate) q = q.lte("date", toDate);
  const { data } = await q;
  return (data as AttendanceRecord[]) ?? [];
}

export async function getUserStats(
  userId: string,
  joinedAt: string
): Promise<MemberStats> {
  const records = await getUserAttendanceHistory(userId);
  const presentDates = records.map((r) => r.date);

  const joined = new Date(joinedAt);
  const today = new Date();
  const totalDaysSinceJoin =
    Math.floor((today.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24)) +
    1;

  const presentDays = presentDates.length;
  const absentDays = Math.max(0, totalDaysSinceJoin - presentDays);
  const rate =
    totalDaysSinceJoin === 0
      ? 0
      : Math.round((presentDays / totalDaysSinceJoin) * 1000) / 10;

  const { current, best } = calculateStreak(presentDates);

  return {
    totalDays: totalDaysSinceJoin,
    presentDays,
    absentDays,
    rate,
    currentStreak: current,
    bestStreak: best,
    lastCheckIn: records[0]?.checked_in_at ?? null,
  };
}

export async function getAttendanceForDate(
  date: string
): Promise<AttendanceWithProfile[]> {
  const supabase = createClient();
  const { data: rows, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("date", date)
    .order("checked_in_at", { ascending: false });
  if (error) {
    console.error("[getAttendanceForDate]", error.message);
    return [];
  }
  return attachProfilesToAttendance(supabase, (rows as AttendanceRecord[]) ?? []);
}

export async function getAttendanceInRange(
  fromDate: string,
  toDate: string
): Promise<AttendanceWithProfile[]> {
  const supabase = createClient();
  const { data: rows, error } = await supabase
    .from("attendance")
    .select("*")
    .gte("date", fromDate)
    .lte("date", toDate)
    .order("date", { ascending: true });
  if (error) {
    console.error("[getAttendanceInRange]", error.message);
    return [];
  }
  return attachProfilesToAttendance(supabase, (rows as AttendanceRecord[]) ?? []);
}

export interface MemberAttendanceSummary {
  profile: Profile;
  presentDays: number;
  absentDays: number;
  rate: number;
  bestStreak: number;
  lastCheckIn: string | null;
}

export async function getRangeReport(
  fromDate: string,
  toDate: string
): Promise<MemberAttendanceSummary[]> {
  const supabase = createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("account_status", "approved")
    .eq("role", "member");
  const { data: records } = await supabase
    .from("attendance")
    .select("*")
    .gte("date", fromDate)
    .lte("date", toDate);

  const totalDays =
    Math.floor(
      (new Date(toDate).getTime() - new Date(fromDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  const grouped = new Map<string, AttendanceRecord[]>();
  for (const r of (records ?? []) as AttendanceRecord[]) {
    if (!grouped.has(r.user_id)) grouped.set(r.user_id, []);
    grouped.get(r.user_id)!.push(r);
  }

  return ((profiles ?? []) as Profile[]).map((p) => {
    const userRecs = grouped.get(p.id) ?? [];
    const presentDays = userRecs.length;
    const absentDays = Math.max(0, totalDays - presentDays);
    const rate =
      totalDays === 0 ? 0 : Math.round((presentDays / totalDays) * 1000) / 10;
    const { best } = calculateStreak(userRecs.map((r) => r.date));
    const lastCheckIn =
      userRecs
        .map((r) => r.checked_in_at)
        .sort()
        .pop() ?? null;
    return {
      profile: p,
      presentDays,
      absentDays,
      rate,
      bestStreak: best,
      lastCheckIn,
    };
  });
}
