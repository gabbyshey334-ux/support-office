import Link from "next/link";
import type { Metadata } from "next";
import { Clock, LayoutDashboard, MessageCircle } from "lucide-react";

export const metadata: Metadata = { title: "Awaiting approval" };

export default function PendingPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-[480px] text-center fade-up">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <Clock className="h-8 w-8 slow-spin" strokeWidth={2} />
        </div>

        <h1 className="mt-8 font-display text-2xl font-semibold text-slate-900 sm:text-[28px]">
          Registration Submitted!
        </h1>
        <p className="mt-4 text-base leading-[1.7] text-slate-600">
          Your application has been received. The admin will review your details
          and approve your account shortly. You will receive a WhatsApp message
          once you&apos;re approved.
        </p>

        <div className="mt-8 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-left">
          <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          <p className="text-sm font-medium text-green-900">
            Check your WhatsApp for updates
          </p>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-slate-600">
          You can sign in anytime with the email and password you just used. If you
          are still pending approval, you will stay on this status screen. After an
          admin approves you, the same sign-in takes you straight to your member
          dashboard.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden />
            Sign in (opens dashboard when approved)
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
          >
            Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
