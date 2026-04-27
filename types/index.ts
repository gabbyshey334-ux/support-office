export type MemberStatus =
  | "newbie"
  | "probie"
  | "pro"
  | "distributor"
  | "manager"
  | "senior_managers";

/** @deprecated Use MemberStatus */
export type NeolifeStatus = MemberStatus;

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
  status: MemberStatus;
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

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  newbie: "Newbie",
  probie: "Probie",
  pro: "Pro",
  distributor: "Distributor",
  manager: "Manager",
  senior_managers: "Senior Managers",
};

/** Display label for profile status (handles legacy DB values until migrated). */
export function memberStatusLabel(status: string): string {
  if (status in MEMBER_STATUS_LABELS) {
    return MEMBER_STATUS_LABELS[status as MemberStatus];
  }
  return status.replace(/_/g, " ");
}

export const MEMBER_STATUS_OPTIONS: { value: MemberStatus; label: string }[] =
  (Object.keys(MEMBER_STATUS_LABELS) as MemberStatus[]).map((value) => ({
    value,
    label: MEMBER_STATUS_LABELS[value],
  }));

/** @deprecated Use MEMBER_STATUS_LABELS */
export const NEOLIFE_STATUS_LABELS = MEMBER_STATUS_LABELS;
/** @deprecated Use MEMBER_STATUS_OPTIONS */
export const NEOLIFE_STATUS_OPTIONS = MEMBER_STATUS_OPTIONS;
