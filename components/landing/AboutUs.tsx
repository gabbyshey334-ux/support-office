"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SupportOfficeWordmark } from "@/components/ui/SupportOfficeWordmark";

const leaders = [
  {
    slug: "jagunmolu-abdulfatai",
    imageSrc: "/about/jagunmolu-abdulfatai.jpg",
    name: "Mr. Jagunmolu Abdulfatai",
    title: "FHG Founder",
    rank: "2 Diamond Director · Neolife International",
    initials: "JA",
    gradient: "from-[#0A1628] via-[#1E4DB7] to-[#0F2040]",
    accent: "from-amber-400/90 to-amber-600/80",
  },
  {
    slug: "fagbodun-adeyinka-david",
    imageSrc: "/about/fagbodun-adeyinka-david.jpg",
    name: "Mr. Fagbodun Adeyinka David",
    title: "Ilaro 001",
    rank: "2 Ruby Director · Neolife International",
    initials: "FD",
    gradient: "from-rose-900 via-red-950 to-slate-950",
    accent: "from-rose-300/80 to-amber-500/60",
  },
  {
    slug: "oreofe-sanni",
    imageSrc: "/about/oreofe-sanni.jpg",
    name: "Mr. Oreofe Sanni",
    title: "Our Team Leader",
    rank: "Executive Manager",
    initials: "OS",
    gradient: "from-emerald-950 via-teal-900 to-slate-950",
    accent: "from-emerald-300/70 to-cyan-500/50",
  },
] as const;

function LeaderPortrait({
  src,
  alt,
  initials,
  gradient,
}: {
  src: string;
  alt: string;
  initials: string;
  gradient: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "flex h-full min-h-[300px] w-full items-center justify-center bg-gradient-to-br font-display text-5xl font-bold tracking-tight text-white/95 md:min-h-[340px]",
          gradient
        )}
        aria-hidden
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover object-top transition duration-700 ease-out group-hover:scale-[1.04]"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 360px"
      onError={() => setFailed(true)}
      unoptimized
    />
  );
}

export function AboutUs() {
  return (
    <section
      id="about"
      className="relative scroll-mt-24 overflow-hidden bg-white"
    >
      <div
        className="relative border-y border-slate-200/80 bg-gradient-to-br from-[#050D1F] via-[#0A1628] to-[#0F2040] px-4 py-16 text-white sm:px-6 md:py-20 lg:px-8"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
        }}
        aria-hidden
      />
      <div
          className="pointer-events-none absolute -right-20 top-1/2 h-[min(90vw,520px)] w-[min(90vw,520px)] -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
              "radial-gradient(circle at 30% 30%, rgba(37,99,235,0.45), transparent 65%)",
        }}
        aria-hidden
      />

        <div className="relative mx-auto max-w-5xl text-center fade-up">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-200">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
            About us
          </div>
          <h2 className="mt-6 font-display text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl">
            Built on{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              global standards
            </span>{" "}
            and Nigerian leadership
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-300 md:text-lg">
            <strong className="font-semibold text-white">NeoLife</strong> is an
            international nutrition company with a long heritage in whole-food
            supplementation and science-led product development—serving customers
            and independent distributors across many countries, including markets
            in Africa.
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-300 md:text-lg">
            <strong className="font-semibold text-white">
              Faitheroic Generation (FHG)
            </strong>{" "}
            is a Nigerian entrepreneurial community associated with that
            ecosystem—emphasising mentorship, discipline, and growth.{" "}
            <SupportOfficeWordmark className="inline text-[1.2em] text-white" /> is
            the attendance layer for our members: clear records, respectful
            communication, and a product experience that matches the calibre of
            the team.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
            <a
              href="https://www.neolife.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-2 font-medium text-white transition hover:border-white/35 hover:bg-white/10"
            >
              NeoLife
              <ArrowUpRight className="h-4 w-4 opacity-80" aria-hidden />
            </a>
            <a
              href="https://faitheroic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-2 font-medium text-white transition hover:border-white/35 hover:bg-white/10"
            >
              Faitheroic (FHG)
              <ArrowUpRight className="h-4 w-4 opacity-80" aria-hidden />
            </a>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 font-semibold text-[#1E4DB7] shadow-lg transition hover:bg-blue-50 active:scale-[0.98]"
            >
              <span className="font-sans">Join</span>{" "}
              <SupportOfficeWordmark className="inline text-[1.15em] text-[#1E4DB7]" />
            </Link>
            </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,720px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-slate-300 to-transparent"
          aria-hidden
        />

        <div className="mx-auto max-w-3xl text-center fade-up">
          <h3 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">
            What you should feel here
          </h3>
          <p className="mt-4 text-base leading-relaxed text-slate-700 md:text-lg">
            Premium does not mean loud—it means precision. Fewer distractions,
            stronger typography, and a layout that respects your time. The
            section below honours the leaders who set the tone for FHG and this{" "}
            <SupportOfficeWordmark className="inline text-[1.12em] text-slate-900" />
            .
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-6xl">
          <div className="mb-10 flex flex-col items-center gap-3 text-center md:mb-14">
            <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">
              Leadership
            </span>
            <h3 className="font-display text-3xl font-bold text-slate-900 md:text-4xl">
            The people behind the mission
          </h3>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              These are the people who set the tone for FHG and this{" "}
              <SupportOfficeWordmark className="inline text-[1.08em] text-slate-800" />
              —vision you can feel, ranks earned in the field, and a steady
              hand for the team. When you register and attend, you are stepping into
              a culture they shaped: clear expectations, mutual respect, and growth
              that rewards consistency.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3 md:gap-8 lg:gap-10">
            {leaders.map((leader, index) => (
              <article
                key={leader.slug}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white shadow-[0_28px_80px_-32px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/[0.04] transition duration-500 hover:-translate-y-1 hover:shadow-[0_36px_100px_-28px_rgba(15,23,42,0.4)]",
                  index === 0 && "fade-up-1",
                  index === 1 && "fade-up-2",
                  index === 2 && "fade-up-3"
                )}
              >
                <div className="pointer-events-none absolute inset-x-6 top-0 z-10 h-px bg-gradient-to-r from-transparent via-slate-300/80 to-transparent" />
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
                  <LeaderPortrait
                    src={leader.imageSrc}
                    alt={`Official portrait of ${leader.name}`}
                    initials={leader.initials}
                    gradient={leader.gradient}
                  />
                  <div
                    className={cn(
                      "pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-50 blur-2xl",
                      `bg-gradient-to-br ${leader.accent}`
                    )}
                    aria-hidden
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-7">
                    <p className="font-display text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
                      {leader.name}
                    </p>
                    <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-blue-200">
                      {leader.title}
                    </p>
                    <p className="mt-3 max-w-[18rem] text-sm font-medium leading-snug text-slate-200">
                      {leader.rank}
                    </p>
                  </div>
                </div>
                <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50 to-white px-6 py-5 text-center">
                  <p className="flex flex-wrap items-center justify-center gap-x-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <SupportOfficeWordmark className="text-[1.35rem] normal-case tracking-normal text-slate-700" />
                    <span aria-hidden>·</span>
                    <span>FHG &amp; Neolife</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
