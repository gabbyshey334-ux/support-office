"use client";

import { TodayPie, SevenDayTrend } from "@/components/admin/OverviewCharts";

export default function AdminOverviewChartsClient({
  presentToday,
  absentToday,
  days,
}: {
  presentToday: number;
  absentToday: number;
  days: { date: string; rate: number }[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <TodayPie present={presentToday} absent={absentToday} />
      <SevenDayTrend data={days} />
    </div>
  );
}
