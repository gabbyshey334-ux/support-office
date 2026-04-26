import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const memberCreateSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Only letters, numbers, _ . - allowed"),
  phone_whatsapp: z
    .string()
    .regex(/^\+?[1-9]\d{6,14}$/, "Use international format e.g. +234...")
    .optional()
    .or(z.literal("")),
  role: z.enum(["admin", "leader", "member"]),
  team: z.string().min(1, "Team is required"),
});
export type MemberCreateInput = z.infer<typeof memberCreateSchema>;

export const memberUpdateSchema = memberCreateSchema.omit({
  email: true,
  password: true,
});
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;

export const passwordResetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type DateRangeInput = z.infer<typeof dateRangeSchema>;

export const checkInSchema = z.object({
  scanned_id: z.string().uuid("Invalid QR code"),
});
export type CheckInInput = z.infer<typeof checkInSchema>;
