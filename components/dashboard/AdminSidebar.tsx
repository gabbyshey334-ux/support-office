"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BarChart2,
  ClipboardCheck,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOutAction } from "@/lib/actions/auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Profile } from "@/types";
import { SupportOfficeWordmark } from "@/components/ui/SupportOfficeWordmark";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/admin/reports", label: "Reports", icon: BarChart2 },
  {
    href: "/admin/approvals",
    label: "Approvals",
    icon: ClipboardCheck,
    badge: true,
  },
];

function SidebarContent({
  profile,
  pendingCount,
  onNavigate,
}: {
  profile: Profile;
  pendingCount: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <div
      className="flex h-full flex-col text-white"
      style={{ background: "var(--so-slate-900)" }}
    >
      <div className="border-b border-slate-800 p-5">
        <div className="min-w-0">
          <SupportOfficeWordmark className="block truncate text-[1.45rem] leading-none text-white" />
          <span className="mt-1 inline-block rounded-full bg-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-300">
            Admin Panel
          </span>
        </div>
      </div>

      <p className="mx-4 mb-2 mt-5 text-[11px] font-medium uppercase tracking-widest text-slate-600">
        Main menu
      </p>
      <nav className="flex-1 space-y-1 px-3 pb-4">
        {items.map((it) => {
          const active = it.exact
            ? pathname === it.href
            : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={onNavigate}
              className={cn(
                "mx-0 flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition active:scale-[0.98]",
                active
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <span className="flex items-center gap-3">
                <it.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0",
                    active ? "text-white" : "text-slate-400"
                  )}
                />
                {it.label}
              </span>
              {it.badge && pendingCount > 0 && (
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-center text-[11px] font-bold text-amber-950">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 px-1">
          <Avatar className="h-10 w-10 border border-slate-700">
            {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
            <AvatarFallback className="bg-slate-700 text-xs font-semibold text-white">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {profile.full_name}
            </p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>
        <form action={signOutAction} className="mt-3">
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-700 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-600 active:scale-[0.98]"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminSidebar({
  profile,
  pendingCount,
}: {
  profile: Profile;
  pendingCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] lg:block">
        <SidebarContent profile={profile} pendingCount={pendingCount} />
      </aside>

      <div className="fixed left-3 top-3 z-40 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="rounded-xl bg-slate-900 p-2.5 text-white shadow-lg transition active:scale-[0.95]"
              style={{ background: "var(--so-slate-900)" }}
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SidebarContent
              profile={profile}
              pendingCount={pendingCount}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

export function AdminPendingBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
      {count}
    </span>
  );
}
