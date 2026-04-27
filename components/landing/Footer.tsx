import Link from "next/link";
import { SupportOfficeWordmark } from "@/components/ui/SupportOfficeWordmark";

export function Footer() {
  return (
    <footer className="bg-slate-900 py-14 text-slate-400 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <SupportOfficeWordmark className="block text-3xl leading-none text-white" />
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Track your commitment. Celebrate your consistency.
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm font-medium">
            <a
              href="#about"
              className="text-slate-300 transition hover:text-white active:scale-[0.98]"
            >
              About
            </a>
            <a
              href="#features"
              className="text-slate-300 transition hover:text-white active:scale-[0.98]"
            >
              Platform
            </a>
            <Link
              href="/login"
              className="text-slate-300 transition hover:text-white active:scale-[0.98]"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-slate-300 transition hover:text-white active:scale-[0.98]"
            >
              Register
            </Link>
          </nav>
        </div>
        <p className="mt-10 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          © 2025 FHG &amp; Neolife Support Office. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
