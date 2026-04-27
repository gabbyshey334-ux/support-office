import { z } from "zod";

export const neolifeStatusEnum = z.enum([
  "distributor",
  "senior_distributor",
  "bronze",
  "silver",
  "gold",
  "senior_gold",
  "executive",
  "ruby",
  "emerald",
  "diamond",
]);

const phoneRegex = /^(\+?234|0)?[789][01]\d{8}$/;

export const registerStep1Schema = z
  .object({
    full_name: z.string().min(2, "Full name is required"),
    date_of_birth: z
      .string()
      .min(1, "Date of birth is required")
      .refine((d) => {
        const dob = new Date(d);
        if (Number.isNaN(dob.getTime())) return false;
        const age =
          (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return age >= 16;
      }, "You must be at least 16 years old"),
    phone_whatsapp: z
      .string()
      .regex(phoneRegex, "Enter a valid Nigerian phone number"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(8, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const registerStep2Schema = z.object({
  sponsor_name: z.string().min(2, "Sponsor name is required"),
  upline_name: z.string().min(2, "Upline name is required"),
  team: z.string().optional().default("Support Office"),
  status: neolifeStatusEnum,
});

export const registerStep3Schema = z.object({
  confirm_accuracy: z.literal(true, {
    errorMap: () => ({ message: "You must confirm the information" }),
  }),
});

export const fullRegisterSchema = z
  .object({
    full_name: z.string().min(2),
    date_of_birth: z.string().min(1),
    phone_whatsapp: z.string().regex(phoneRegex),
    email: z.string().email(),
    password: z.string().min(8),
    confirm_password: z.string().min(8),
    sponsor_name: z.string().min(2),
    upline_name: z.string().min(2),
    team: z.string().optional().default("Support Office"),
    status: neolifeStatusEnum,
    confirm_accuracy: z.literal(true),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type RegisterFormValues = z.infer<typeof fullRegisterSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const setupSchema = z
  .object({
    full_name: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(8, "Please confirm your password"),
    setup_key: z.string().min(1, "Setup key is required"),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
export type SetupFormValues = z.infer<typeof setupSchema>;

export const adminAddMemberSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email(),
  password: z.string().min(8),
  date_of_birth: z.string().min(1),
  phone_whatsapp: z.string().regex(phoneRegex, "Enter a valid Nigerian phone"),
  sponsor_name: z.string().min(2),
  upline_name: z.string().min(2),
  team: z.string().min(1).default("Support Office"),
  status: neolifeStatusEnum,
});
export type AdminAddMemberValues = z.infer<typeof adminAddMemberSchema>;

export const profileUpdateSchema = z.object({
  phone_whatsapp: z.string().regex(phoneRegex, "Enter a valid Nigerian phone"),
  team: z.string().min(1, "Team is required"),
  avatar_url: z.string().optional().nullable(),
});
export type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;

export const passwordChangeSchema = z
  .object({
    new_password: z.string().min(8, "Min 8 characters"),
    confirm_password: z.string().min(8),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;
