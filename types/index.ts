export type NeolifeStatus =
  | "distributor"
  | "senior_distributor"
  | "bronze"
  | "silver"
  | "gold"
  | "senior_gold"
  | "executive"
  | "ruby"
  | "emerald"
  | "diamond";

export type UserRole = "admin" | "member";
export type AccountStatus = "pending" | "approved" | "rejected";
export type AttendanceMethod = "qr" | "manual" | "admin";

export interface Profile {
  id: string;
  full_name: string;
  sponsor_name: string;
  upline_name: string;
  phone_whatsapp: string;
  date_of_birth: string;
  status: NeolifeStatus;
  team: string;
  role: UserRole;
  account_status: AccountStatus;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  checked_in_at: string;
  method: AttendanceMethod;
  marked_by: string | null;
  notes: string | null;
}

export interface AttendanceWithProfile extends AttendanceRecord {
  profile: Pick<Profile, "id" | "full_name" | "avatar_url" | "team">;
}

export interface NotificationLog {
  id: string;
  type: string;
  recipient_id: string | null;
  message: string;
  sent_at: string;
  status: string;
}

export interface MemberStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  rate: number;
  currentStreak: number;
  bestStreak: number;
  lastCheckIn: string | null;
}

export interface DailyAttendanceSummary {
  date: string;
  present: number;
  absent: number;
  total: number;
  rate: number;
}

export const NEOLIFE_STATUS_LABELS: Record<NeolifeStatus, string> = {
  distributor: "Distributor",
  senior_distributor: "Senior Distributor",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  senior_gold: "Senior Gold",
  executive: "Executive",
  ruby: "Ruby",
  emerald: "Emerald",
  diamond: "Diamond",
};

export const NEOLIFE_STATUS_OPTIONS: { value: NeolifeStatus; label: string }[] =
  Object.entries(NEOLIFE_STATUS_LABELS).map(([value, label]) => ({
    value: value as NeolifeStatus,
    label,
  }));
