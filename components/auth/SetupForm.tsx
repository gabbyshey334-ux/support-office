"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { SupportOfficeWordmark } from "@/components/ui/SupportOfficeWordmark";
import { setupSchema, type SetupFormValues } from "@/lib/validations";
import { setupAction } from "@/lib/actions/auth";

export function SetupForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupFormValues>({ resolver: zodResolver(setupSchema) });

  const onSubmit = async (values: SetupFormValues) => {
    setLoading(true);
    const res = await setupAction(values);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Admin account created. Please log in.");
    router.push("/login");
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="mb-6 flex justify-center">
        <SupportOfficeWordmark className="text-[2rem] leading-none text-slate-900 sm:text-[2.25rem]" />
      </div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create First Admin
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          One-time setup. Available only when no admin exists.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field
          label="Full Name"
          error={errors.full_name?.message}
          input={<Input placeholder="John Doe" {...register("full_name")} />}
        />
        <Field
          label="Email"
          error={errors.email?.message}
          input={
            <Input
              type="email"
              placeholder="admin@example.com"
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
              {...register("password")}
            />
          }
        />
        <Field
          label="Confirm Password"
          error={errors.confirm_password?.message}
          input={
            <Input
              type="password"
              placeholder="Re-enter password"
              {...register("confirm_password")}
            />
          }
        />
        <Field
          label="Setup Secret Key"
          error={errors.setup_key?.message}
          input={
            <Input
              type="password"
              placeholder="From SETUP_SECRET_KEY env"
              {...register("setup_key")}
            />
          }
        />

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? <Spinner /> : "Create Admin Account"}
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  input,
  error,
}: {
  label: string;
  input: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {input}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
