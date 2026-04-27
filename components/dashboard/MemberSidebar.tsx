"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  QrCode,
  CalendarDays,
  UserCircle,
  LogOut,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOutAction } from "@/lib/actions/auth";
import type { Profile } from "@/types";
import { SupportOfficeWordmark } from "@/components/ui/SupportOfficeWordmark";

const items = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/attendance", label: "My QR", icon: QrCode },
  { href: "/dashboard/history", label: "History", icon: CalendarDays },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
];

export function MemberSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="border-b border-slate-200 px-4 py-5">
          <div className="min-w-0">
            <SupportOfficeWordmark className="block truncate text-[1.35rem] leading-none text-slate-900" />
            <span className="badge-admin mt-1 inline-block text-[10px]">Member</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((it) => {
            const active = it.exact
              ? pathname === it.href
              : pathname.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "mx-0 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition active:scale-[0.98]",
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <it.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0",
                    active ? "text-blue-600" : "text-slate-500"
                  )}
                />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="mx-3 mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-white shadow-sm">
              {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {profile.full_name}
              </p>
              <p className="truncate text-xs text-slate-600">{profile.team}</p>
            </div>
          </div>
          <form action={signOutAction} className="mt-3">
            <button
              type="submit"
              className="w-full rounded-lg py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 active:scale-[0.98]"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white lg:hidden">
        <div className="grid h-16 grid-cols-4">
          {items.map((it) => {
            const active = it.exact
              ? pathname === it.href
              : pathname.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition active:scale-[0.95]",
                  active ? "text-blue-600" : "text-slate-600"
                )}
              >
                <it.icon className="h-[22px] w-[22px]" />
                {it.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
