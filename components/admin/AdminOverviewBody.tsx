"use client";

import {
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TodayPie, SevenDayTrend } from "@/components/admin/OverviewCharts";
import {
  LiveCheckInFeed,
  type FeedItem,
} from "@/components/admin/LiveCheckInFeed";

export default function AdminOverviewBody({
  memberCount,
  presentToday,
  absentToday,
  rate,
  days,
  feed,
}: {
  memberCount: number;
  presentToday: number;
  absentToday: number;
  rate: number;
  days: { date: string; rate: number }[];
  feed: FeedItem[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Total Members"
          value={memberCount}
          icon={Users}
          color="blue"
          delay={0}
          fadeClass="fade-up-0"
        />
        <StatsCard
          title="Present Today"
          value={presentToday}
          icon={CheckCircle}
          color="green"
          delay={0.05}
          fadeClass="fade-up-1"
        />
        <StatsCard
          title="Absent Today"
          value={absentToday}
          icon={XCircle}
          color="red"
          delay={0.1}
          fadeClass="fade-up-2"
        />
        <StatsCard
          title="Attendance Rate"
          value={Number.isFinite(rate) ? rate : 0}
          suffix="%"
          icon={TrendingUp}
          color="amber"
          delay={0.15}
          fadeClass="fade-up-3"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TodayPie present={presentToday} absent={absentToday} />
        <SevenDayTrend data={days} />
      </div>

      <LiveCheckInFeed initial={feed} />
    </div>
  );
}
