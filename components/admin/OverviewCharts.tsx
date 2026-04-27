"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function TodayPie({ present, absent }: { present: number; absent: number }) {
  const data = [
    { name: "Present", value: present, color: "#2563EB" },
    { name: "Absent", value: absent, color: "#EF4444" },
  ];
  const total = present + absent || 1;
  return (
    <div className="fade-up rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h3 className="font-display text-base font-semibold text-slate-900">
        Today&apos;s Attendance
      </h3>
      <p className="mt-1 text-[13px] text-slate-600">
        {Math.round((present / total) * 100)}% present right now
      </p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
              dataKey="value"
              stroke="#fff"
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-6 text-sm text-slate-700">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          Present {present}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          Absent {absent}
        </span>
      </div>
    </div>
  );
}

export function SevenDayTrend({
  data,
}: {
  data: { date: string; rate: number }[];
}) {
  return (
    <div className="fade-up-1 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h3 className="font-display text-base font-semibold text-slate-900">
        7-Day Trend
      </h3>
      <p className="mt-1 text-[13px] text-slate-600">
        Daily attendance rate (% of members present)
      </p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#64748B" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748B" }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            />
            <Bar dataKey="rate" fill="#60A5FA" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DailyBarChart({
  data,
}: {
  data: { date: string; present: number; absent: number }[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="font-display text-base font-semibold text-slate-900">
        Daily Attendance Count
      </h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="present" stackId="a" fill="#60A5FA" radius={[8, 8, 0, 0]} />
            <Bar dataKey="absent" stackId="a" fill="#FECACA" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
