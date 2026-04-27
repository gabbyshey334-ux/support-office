"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, getInitials } from "@/lib/utils";
import type { Profile } from "@/types";

const routeTitle: Record<string, string> = {
  "/dashboard": "Home",
  "/dashboard/attendance": "My QR",
  "/dashboard/history": "History",
  "/dashboard/profile": "Profile",
};

export function Topbar({
  profile,
  title: titleOverride,
}: {
  profile: Profile;
  title?: string;
}) {
  const pathname = usePathname();
  const title =
    titleOverride ??
    routeTitle[pathname] ??
    (pathname.startsWith("/dashboard") ? "Dashboard" : "Support Office");

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <div className="min-w-0">
          <h1 className="truncate font-display text-lg font-semibold text-slate-900">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <time
            className="hidden text-sm text-slate-600 sm:block"
            dateTime={new Date().toISOString()}
          >
            {formatDate(new Date())}
          </time>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 active:scale-[0.98]"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <Avatar className="h-9 w-9 border border-slate-200">
            {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
            <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
