"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials, formatRelative } from "@/lib/utils";
import type { Profile } from "@/types";

interface MemberCardProps {
  profile: Profile;
  lastCheckIn?: string | null;
  rate?: number;
  onClick?: () => void;
}

export default function MemberCard({
  profile,
  lastCheckIn,
  rate,
  onClick,
}: MemberCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow"
    >
      <Avatar className="h-12 w-12">
        <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-900">
            {profile.full_name}
          </p>
          <Badge
            variant={
              profile.role === "admin"
                ? "default"
                : profile.role === "leader"
                  ? "warning"
                  : "secondary"
            }
            className="capitalize"
          >
            {profile.role}
          </Badge>
        </div>
        <p className="text-xs text-slate-500">
          {profile.team} · @{profile.username}
        </p>
        {lastCheckIn && (
          <p className="mt-1 text-xs text-slate-400">
            Last seen {formatRelative(lastCheckIn)}
          </p>
        )}
      </div>
      {typeof rate === "number" && (
        <div className="text-right">
          <p className="text-xl font-bold text-slate-900">{rate}%</p>
          <p className="text-xs text-slate-500">attendance</p>
        </div>
      )}
    </motion.button>
  );
}
