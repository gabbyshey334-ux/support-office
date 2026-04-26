"use client";

import { Bell } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import type { Profile } from "@/types";

interface TopbarProps {
  title: string;
  profile: Profile;
  description?: string;
}

export default function Topbar({ title, profile, description }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur md:px-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 md:text-xl">{title}</h1>
        <p className="hidden text-xs text-slate-500 md:block">
          {description ?? format(new Date(), "EEEE, dd MMMM yyyy")}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          aria-label="Notifications"
          className="relative hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 md:flex"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-slate-900">
              {profile.full_name}
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {profile.role}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
