"use client";

import {
  CalendarCheck2,
  CalendarDays,
  Flame,
  Trophy,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import StatsCard from "@/components/StatsCard";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import AttendanceTable from "@/components/AttendanceTable";
import { formatDate, getInitials } from "@/lib/utils";
import type { Attendance, AttendanceStats, Profile } from "@/types";

interface Props {
  profile: Profile;
  history: Attendance[];
  stats: AttendanceStats;
}

export default function ProfileClient({ profile, history, stats }: Props) {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-base">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {profile.full_name}
              </h2>
              <p className="text-sm text-slate-500">@{profile.username}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="default" className="capitalize">
                  {profile.role}
                </Badge>
                <Badge variant="secondary">{profile.team}</Badge>
                {profile.is_active ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="danger">Inactive</Badge>
                )}
              </div>
            </div>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">
                WhatsApp
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {profile.phone_whatsapp || "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">
                Joined
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {formatDate(profile.created_at, "PP")}
              </dd>
            </div>
          </dl>
        </Card>

        <QRCodeDisplay profile={profile} size={180} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="This week"
          value={stats.thisWeek}
          icon={CalendarCheck2}
          delay={0.05}
        />
        <StatsCard
          label="This month"
          value={stats.thisMonth}
          icon={CalendarDays}
          tone="success"
          delay={0.1}
        />
        <StatsCard
          label="Current streak"
          value={`${stats.currentStreak}d`}
          icon={Flame}
          tone="warning"
          delay={0.15}
        />
        <StatsCard
          label="Total"
          value={stats.totalDays}
          icon={Trophy}
          delay={0.2}
        />
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Recent attendance
        </h2>
        <AttendanceTable rows={history} />
      </div>
    </div>
  );
}
