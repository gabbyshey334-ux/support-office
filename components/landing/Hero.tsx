"use client";

import Link from "next/link";
import { Check, Layers, Sparkles } from "lucide-react";
import { SupportOfficeWordmark } from "@/components/ui/SupportOfficeWordmark";

const trustLines = [
  { icon: Layers, text: "Structured for FHG & Neolife teams" },
  { icon: Sparkles, text: "Attendance, streaks, and clarity in one place" },
  { icon: Check, text: "Real-time Updates" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #050D1F 0%, #0A1628 50%, #0F2040 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "rgba(37, 99, 235, 0.15)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="fade-up max-w-xl">
            <SupportOfficeWordmark className="mb-5 block text-[clamp(2.5rem,7vw,3.5rem)] leading-[0.92] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]" />
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#93C5FD]/50 bg-white/5 px-4 py-1.5 text-xs font-semibold text-[#93C5FD] backdrop-blur-sm">
              <span aria-hidden>✦</span>
              Official FHG &amp; Neolife Platform
            </div>

            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[56px]">
              Your Attendance.
              <br />
              Your Record.
              <br />
              Your{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] bg-clip-text text-transparent">
                  Growth
                </span>
                <span
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] opacity-90"
                  aria-hidden
                />
              </span>
              .
            </h1>

            <p className="mt-6 max-w-[480px] text-lg leading-[1.7] text-slate-300">
              The official attendance platform for FHG &amp; Neolife Support
              Office members. Track your consistency, build your streak, and show
              up every day.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-center text-base font-semibold text-[#1E4DB7] shadow-lg transition hover:bg-slate-100 active:scale-[0.98]"
              >
                Register Now
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white px-6 py-3 text-center text-base font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {trustLines.map((row) => (
                <div
                  key={row.text}
                  className="flex items-center gap-3 rounded-xl border border-white/12 bg-white/[0.06] px-4 py-2.5 text-sm text-slate-200"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#93C5FD]">
                    <row.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="font-medium leading-snug">{row.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up-1 flex justify-center lg:justify-end">
            <div
              className="w-full max-w-[380px] animate-hero-float rounded-2xl border border-white/12 bg-white/[0.06] p-6 shadow-[0_32px_64px_rgba(0,0,0,0.4)] backdrop-blur-sm"
              aria-label="Illustrative dashboard preview"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Member workspace
              </p>
              <p className="mt-1 font-display text-xl font-semibold text-white">
                Today at a glance
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Check-in status for today",
                  "Streak and monthly rhythm",
                  "Recent activity on your dashboard",
                ].map((line) => (
                  <li
                    key={line}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>This month</span>
                  <span className="text-slate-500">Illustration only</span>
                </div>
                <div className="mt-3 flex gap-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-8 flex-1 rounded-md bg-white/10"
                      style={{ opacity: 0.35 + (i % 3) * 0.15 }}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-slate-500">
                Real numbers appear in your dashboard after you join.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
