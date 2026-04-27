"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  registerStep1Schema,
  registerStep2Schema,
  registerStep3Schema,
  fullRegisterSchema,
  type RegisterFormValues,
} from "@/lib/validations";
import {
  NEOLIFE_STATUS_OPTIONS,
  NEOLIFE_STATUS_LABELS,
  type NeolifeStatus,
} from "@/types";
import { registerAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Neolife Details" },
  { id: 3, label: "Review & Submit" },
];

function normalizePhone(input: string): string {
  const t = input.replace(/\s/g, "").trim();
  if (!t) return "";
  if (t.startsWith("+")) return t;
  const d = t.replace(/\D/g, "");
  if (d.startsWith("234")) return `+${d}`;
  if (d.startsWith("0")) return `+234${d.slice(1)}`;
  return `+234${d}`;
}

function statusDotClass(s: NeolifeStatus): string {
  const map: Record<NeolifeStatus, string> = {
    distributor: "bg-slate-600",
    senior_distributor: "bg-slate-600",
    bronze: "bg-amber-500",
    silver: "bg-slate-400",
    gold: "bg-yellow-500",
    senior_gold: "bg-yellow-600",
    executive: "bg-violet-600",
    ruby: "bg-red-500",
    emerald: "bg-emerald-500",
    diamond: "bg-blue-600",
  };
  return map[s];
}

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(fullRegisterSchema) as unknown as Resolver<RegisterFormValues>,
    mode: "onTouched",
    defaultValues: {
      team: "Support Office",
      status: "distributor",
      confirm_accuracy: false as unknown as true,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = form;

  const values = watch();

  const step1Keys = useMemo(
    () =>
      [
        "full_name",
        "date_of_birth",
        "phone_whatsapp",
        "email",
        "password",
        "confirm_password",
      ] as const,
    []
  );
  const step2Keys = useMemo(
    () => ["sponsor_name", "upline_name", "team", "status"] as const,
    []
  );

  const stepHasErrors = useMemo(() => {
    if (step === 1)
      return step1Keys.some((k) => !!errors[k]);
    if (step === 2) return step2Keys.some((k) => !!errors[k]);
    if (step === 3) return !!errors.confirm_accuracy;
    return false;
  }, [step, errors, step1Keys, step2Keys]);

  const next = async () => {
    let valid = false;
    if (step === 1) {
      const normalized = normalizePhone(values.phone_whatsapp ?? "");
      setValue("phone_whatsapp", normalized, { shouldValidate: true });
      valid = await trigger([...step1Keys]);
      if (valid) {
        const r = registerStep1Schema.safeParse(values);
        valid = r.success;
        if (!r.success) toast.error(r.error.errors[0]?.message ?? "Check your details");
      }
    } else if (step === 2) {
      valid = await trigger([...step2Keys]);
      if (valid) {
        const r = registerStep2Schema.safeParse(values);
        valid = r.success;
        if (!r.success) toast.error(r.error.errors[0]?.message ?? "Check your details");
      }
    }
    if (valid) setStep((s) => Math.min(3, s + 1));
  };

  const prev = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = async (data: RegisterFormValues) => {
    const normalized = {
      ...data,
      phone_whatsapp: normalizePhone(data.phone_whatsapp ?? ""),
    };
    const r3 = registerStep3Schema.safeParse(normalized);
    if (!r3.success) {
      toast.error(r3.error.errors[0]?.message ?? "Please confirm");
      return;
    }

    setSubmitting(true);
    const res = await registerAction(normalized);
    setSubmitting(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Registration submitted!");
    router.push("/pending");
  };

  return (
    <div className="w-full max-w-[680px]">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-2">
          {steps.map((s, i) => {
            const done = step > s.id;
            const active = step === s.id;
            const lineBlue = step > s.id;
            return (
              <div key={s.id} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {i > 0 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 rounded-full",
                        lineBlue ? "bg-blue-600" : "bg-slate-200"
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition",
                      done &&
                        "border-green-500 bg-green-500 text-white",
                      active &&
                        !done &&
                        "border-blue-600 bg-blue-600 text-white",
                      !active &&
                        !done &&
                        "border-slate-200 bg-white text-slate-400"
                    )}
                  >
                    {done ? (
                      <Check className="h-5 w-5" strokeWidth={3} />
                    ) : (
                      s.id
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 rounded-full",
                        step > s.id ? "bg-blue-600" : "bg-slate-200"
                      )}
                    />
                  )}
                </div>
                <p
                  className={cn(
                    "mt-2 text-center text-xs font-medium sm:text-sm",
                    active ? "text-blue-600" : done ? "text-green-600" : "text-slate-400"
                  )}
                >
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {step === 1 && (
            <div className="fade-up space-y-5">
              <div>
                <h2 className="font-display text-[22px] font-semibold text-slate-900">
                  Tell us about yourself
                </h2>
                <p className="mt-1 text-sm text-slate-600">Basic personal details</p>
              </div>

              <Field
                label="Full Name"
                error={errors.full_name?.message}
                input={
                  <Input
                    placeholder="Adaeze Okoro"
                    className="h-11 rounded-xl border-slate-300 text-[15px] focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
                    {...register("full_name")}
                  />
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Date of Birth"
                  error={errors.date_of_birth?.message}
                  input={
                    <Input
                      type="date"
                      className="h-11 rounded-xl border-slate-300 text-[15px] focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
                      {...register("date_of_birth")}
                    />
                  }
                />
                <Field
                  label="Phone Number (WhatsApp)"
                  error={errors.phone_whatsapp?.message}
                  input={
                    <div className="flex overflow-hidden rounded-xl border border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500">
                      <span className="flex shrink-0 items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
                        +234
                      </span>
                      <Input
                        type="tel"
                        placeholder="812 345 6789"
                        className="h-11 flex-1 rounded-none border-0 text-[15px] shadow-none focus-visible:ring-0"
                        {...register("phone_whatsapp")}
                      />
                    </div>
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Email Address"
                  error={errors.email?.message}
                  input={
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="h-11 rounded-xl border-slate-300 text-[15px] focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
                      {...register("email")}
                    />
                  }
                />
                <Field
                  label="Password"
                  error={errors.password?.message}
                  input={
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      className="h-11 rounded-xl border-slate-300 text-[15px] focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
                      {...register("password")}
                    />
                  }
                />
              </div>

              <Field
                label="Confirm Password"
                error={errors.confirm_password?.message}
                input={
                  <Input
                    type="password"
                    placeholder="Re-enter password"
                    className="h-11 rounded-xl border-slate-300 text-[15px] focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
                    {...register("confirm_password")}
                  />
                }
              />
            </div>
          )}

          {step === 2 && (
            <div className="fade-up space-y-5">
              <div>
                <h2 className="font-display text-[22px] font-semibold text-slate-900">
                  Your Neolife Details
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Help us identify your team and upline
                </p>
              </div>

              <Field
                label="Sponsor Name"
                error={errors.sponsor_name?.message}
                hint="The person who introduced you to Neolife"
                input={
                  <Input
                    placeholder="Sponsor full name"
                    className="h-11 rounded-xl border-slate-300 text-[15px] focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
                    {...register("sponsor_name")}
                  />
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Upline Name"
                  error={errors.upline_name?.message}
                  input={
                    <Input
                      placeholder="Your direct upline"
                      className="h-11 rounded-xl border-slate-300 text-[15px] focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
                      {...register("upline_name")}
                    />
                  }
                />
                <Field
                  label="Team Name"
                  error={errors.team?.message}
                  input={
                    <Input
                      placeholder="Support Office"
                      className="h-11 rounded-xl border-slate-300 text-[15px] focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
                      {...register("team")}
                    />
                  }
                />
              </div>

              <div>
                <Label className="mb-1 block text-[13px] font-medium text-slate-700">
                  Neolife Status
                </Label>
                <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-4 text-left text-[15px] text-slate-900 transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "h-2.5 w-2.5 shrink-0 rounded-full",
                            values.status
                              ? statusDotClass(values.status)
                              : "bg-slate-300"
                          )}
                        />
                        {values.status
                          ? NEOLIFE_STATUS_LABELS[values.status]
                          : "Select status"}
                      </span>
                      <span className="text-slate-400">▾</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
                    <ul className="max-h-64 overflow-auto py-1">
                      {NEOLIFE_STATUS_OPTIONS.map((o) => (
                        <li key={o.value}>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 active:scale-[0.99]"
                            onClick={() => {
                              setValue("status", o.value, {
                                shouldValidate: true,
                              });
                              setStatusOpen(false);
                            }}
                          >
                            <span
                              className={cn(
                                "h-2.5 w-2.5 shrink-0 rounded-full",
                                statusDotClass(o.value)
                              )}
                            />
                            {o.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </PopoverContent>
                </Popover>
                {errors.status && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="fade-up space-y-5">
              <div>
                <h2 className="font-display text-[22px] font-semibold text-slate-900">
                  Review your information
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Confirm everything looks correct before submitting.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
                <dl className="grid gap-3 sm:grid-cols-2">
                  <ReviewRow label="Full Name" value={values.full_name} />
                  <ReviewRow label="Email" value={values.email} />
                  <ReviewRow label="Phone" value={values.phone_whatsapp} />
                  <ReviewRow label="Date of Birth" value={values.date_of_birth} />
                  <ReviewRow label="Sponsor" value={values.sponsor_name} />
                  <ReviewRow label="Upline" value={values.upline_name} />
                  <ReviewRow label="Team" value={values.team || "Support Office"} />
                  <div className="sm:col-span-2 flex flex-col gap-1 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <dt className="text-sm font-medium text-slate-600">Neolife Status</dt>
                    <dd className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      {values.status && (
                        <>
                          <span
                            className={cn(
                              "h-2.5 w-2.5 rounded-full",
                              statusDotClass(values.status)
                            )}
                          />
                          {NEOLIFE_STATUS_LABELS[values.status]}
                        </>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300">
                <Checkbox
                  checked={!!values.confirm_accuracy}
                  onCheckedChange={(c: boolean | "indeterminate") =>
                    setValue(
                      "confirm_accuracy",
                      c === true ? (true as const) : (false as unknown as true),
                      { shouldValidate: true }
                    )
                  }
                  className="mt-0.5 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                />
                <span className="text-sm font-medium leading-relaxed text-slate-700">
                  I confirm all info is accurate
                </span>
              </label>
              {errors.confirm_accuracy && (
                <p className="flex items-center gap-1 text-xs text-red-600">
                  <XCircle className="h-3.5 w-3.5 shrink-0" />
                  {errors.confirm_accuracy.message}
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={prev}
              disabled={step === 1}
              className="rounded-xl text-slate-700 hover:bg-slate-100 active:scale-[0.98] disabled:opacity-40"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {step < 3 ? (
              <Button
                type="button"
                onClick={next}
                disabled={stepHasErrors}
                className="rounded-xl bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={submitting}
                className="min-w-[160px] rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70"
              >
                {submitting ? <Spinner /> : "Submit Registration"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  input,
  error,
  hint,
}: {
  label: string;
  input: React.ReactNode;
  error?: string;
  hint?: string;
}) {
  return (
    <div>
      <Label className="mb-1 block text-[13px] font-medium text-slate-700">
        {label}
      </Label>
      {input}
      {hint && !error && (
        <p className="mt-1 text-xs text-slate-600">{hint}</p>
      )}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-sm font-medium text-slate-600">{label}</dt>
      <dd className="text-sm font-semibold text-slate-900 sm:text-right">
        {value || "—"}
      </dd>
    </div>
  );
}
