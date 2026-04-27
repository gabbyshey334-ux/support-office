"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SupportOfficeWordmark } from "@/components/ui/SupportOfficeWordmark";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md transition-shadow",
        scrolled && "shadow-sm shadow-slate-900/5"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 leading-tight">
            <SupportOfficeWordmark className="text-[1.65rem] leading-none text-slate-900 sm:text-[1.75rem]" />
            <span className="hidden sm:inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              FHG × Neolife
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button
            asChild
            variant="ghost"
            className="rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]"
          >
            <a href="#features">Platform</a>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]"
          >
            <a href="#about">About</a>
          </Button>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            className="rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]"
          >
            <Link href="/login">Sign In</Link>
          </Button>
          <Button
            asChild
            className="rounded-xl bg-[#1E4DB7] px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98]"
          >
            <Link href="/register">Register Now</Link>
          </Button>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden hover:bg-slate-50 active:scale-[0.98]"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            <Button
              asChild
              variant="ghost"
              className="justify-center rounded-xl"
              onClick={() => setMobileOpen(false)}
            >
              <a href="#features">Platform</a>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="justify-center rounded-xl"
              onClick={() => setMobileOpen(false)}
            >
              <a href="#about">About</a>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="justify-center rounded-xl"
              onClick={() => setMobileOpen(false)}
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className="rounded-xl bg-[#1E4DB7] font-semibold text-white hover:bg-blue-700 active:scale-[0.98]"
              onClick={() => setMobileOpen(false)}
            >
              <Link href="/register">Register Now</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
