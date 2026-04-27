"use client";

import { Leaf, Target, Shield } from "lucide-react";

const pillars = [
  {
    icon: Leaf,
    title: "Science-backed wellness",
    body:
      "Neolife is a global nutrition company with a long heritage in whole-food supplementation and distributor-led growth—so members align with products and a culture built for the long run.",
  },
  {
    icon: Target,
    title: "Execution & discipline",
    body:
      "Faitheroic Generation (FHG) focuses on mentorship, entrepreneurship, and consistent habits. Support Office exists so attendance and accountability stay clear—without noise or guesswork.",
  },
  {
    icon: Shield,
    title: "Trust by design",
    body:
      "Your attendance record belongs to you and your authorised admins. We do not publish vanity metrics on this page—only leadership context and a platform you can rely on.",
  },
];

export function MissionBand() {
  return (
    <section
      className="relative w-full overflow-hidden py-16 md:py-24"
      style={{
        background: "linear-gradient(90deg, #1E4DB7, #2563EB)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-center font-display text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
          Why Support Office
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center font-display text-2xl font-bold text-white md:text-3xl">
          Premium operations for people who take showing up seriously
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur-md transition hover:bg-white/[0.1]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                <p.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-white">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-blue-100">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
