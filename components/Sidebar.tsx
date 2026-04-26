"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  Home,
  LayoutDashboard,
  LogOut,
  QrCode,
  Users,
  UserCircle,
  FileBarChart2,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Role } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard/today",
    label: "Today",
    icon: Calendar,
    roles: ["admin", "leader"],
  },
  {
    href: "/dashboard/attendance",
    label: "Check-in",
    icon: QrCode,
    roles: ["member", "admin"],
  },
  {
    href: "/dashboard/members",
    label: "Members",
    icon: Users,
    roles: ["admin"],
  },
  {
    href: "/dashboard/reports",
    label: "Reports",
    icon: FileBarChart2,
    roles: ["admin"],
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: UserCircle,
    roles: ["admin", "leader", "member"],
  },
];

export default function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(profile.role));

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-[260px] flex-col bg-slate-900 text-white">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-bold">
            SO
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide">Support Office</div>
            <div className="text-xs text-slate-400">FHG &amp; Neolife</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-600/15 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    active ? "text-brand-300" : "text-slate-400"
                  )}
                />
                {item.label}
                {active && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-brand-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="m-3 rounded-xl bg-slate-800/70 p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-brand-600 text-white">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">
                {profile.full_name}
              </div>
              <Badge variant="outline" className="mt-1 border-slate-600 text-slate-300">
                {profile.role}
              </Badge>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-xs font-medium",
                  active ? "text-brand-600" : "text-slate-500"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
