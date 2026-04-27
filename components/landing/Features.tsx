"use client";

import { QrCode, Flame, MessageCircle } from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "Your personal QR",
    body: "Show your code to an admin. They record your attendance in seconds—timestamped and tied to your profile.",
    iconBg: "bg-blue-50",
    iconColor: "text-[#1E4DB7]",
  },
  {
    icon: Flame,
    title: "Build Your Streak",
    body: "Watch your consistency grow day by day. See your monthly rate, longest streak, and total attendance history.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Confirmations",
    body: "Get an instant WhatsApp message every time your attendance is marked. Never miss a confirmation.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-slate-900 md:text-4xl">
            Everything you need
          </h2>
          <p className="mt-3 text-base text-slate-600 md:text-lg">
            Built for FHG &amp; Neolife members who show up every day.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-px hover:shadow-lg"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${f.iconBg} ${f.iconColor}`}
              >
                <f.icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-slate-900">
                {f.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-slate-600">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
