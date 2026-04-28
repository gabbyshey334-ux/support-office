import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { SupportOfficeWordmark } from "@/components/ui/SupportOfficeWordmark";
import { Check } from "lucide-react";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 lg:bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div
          className="relative hidden flex-col justify-center px-10 py-12 lg:flex lg:px-14"
          style={{
            background: "linear-gradient(160deg, #050D1F, #1E4DB7)",
          }}
        >
          <div className="mx-auto max-w-md">
            <SupportOfficeWordmark className="block text-[clamp(2.75rem,8vw,3.75rem)] leading-[0.95] text-white" />
            <p className="mt-2 text-sm font-medium text-blue-300">
              FHG &amp; Neolife Attendance System
            </p>
            <ul className="mt-10 space-y-4 text-sm text-blue-100">
              {[
                "See your attendance after admins record it",
                "Build your consistency streak",
                "View history and streaks on your dashboard",
              ].map((line) => (
                <li key={line} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-blue-400">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-14 text-sm italic text-slate-400">
              Showing up consistently is the foundation of success.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-4 py-10 sm:px-6 lg:bg-slate-50">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
