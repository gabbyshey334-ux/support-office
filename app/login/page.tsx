"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setSubmitting(false);
      toast.error("Invalid credentials. Please try again.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      toast.error("Could not load your session.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const redirectTo = searchParams.get("redirectedFrom");
    if (redirectTo) {
      router.replace(redirectTo);
    } else if (profile?.role === "member") {
      router.replace("/dashboard/attendance");
    } else {
      router.replace("/dashboard/today");
    }
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[420px]"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-sm">
              SO
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
              Support Office
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              FHG &amp; Neolife Attendance
            </p>
          </div>

          {searchParams.get("error") === "missing_profile" && (
            <div className="mt-6 rounded-xl border border-warning-100 bg-warning-50/70 p-3 text-xs text-warning-700">
              Your session was reset because no profile was found for that
              account. Please sign in again or contact an admin.
            </div>
          )}
          {searchParams.get("setup") === "ok" && (
            <div className="mt-6 rounded-xl border border-success-100 bg-success-50/70 p-3 text-xs text-success-700">
              Admin account created. You can now sign in.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@supportoffice.ng"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-danger-600">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-danger-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="mt-2 w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner /> Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Accounts are admin-created. Contact your team lead for access.
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} FHG &amp; Neolife · Support Office
        </p>
      </motion.div>
    </div>
  );
}
