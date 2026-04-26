export type Role = "admin" | "leader" | "member";
export type AttendanceMethod = "qr" | "manual" | "admin";

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  phone_whatsapp: string | null;
  role: Role;
  team: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  date: string;
  checked_in_at: string;
  method: AttendanceMethod;
  marked_by: string | null;
}

export interface AttendanceWithProfile extends Attendance {
  profile: Pick<Profile, "id" | "full_name" | "username" | "team" | "avatar_url" | "phone_whatsapp" | "role">;
}

export interface AttendanceStats {
  thisWeek: number;
  thisMonth: number;
  currentStreak: number;
  totalDays: number;
}

export interface MemberAttendanceSummary {
  profile: Profile;
  daysPresent: number;
  daysAbsent: number;
  attendanceRate: number;
  streak: number;
  lastCheckIn: string | null;
}

export interface DailyAttendanceCount {
  date: string;
  present: number;
  absent: number;
}

export interface CheckInResult {
  success: boolean;
  message: string;
  time?: string;
  alreadyCheckedIn?: boolean;
}
