import { format, parseISO } from "date-fns";
import type { AttendanceRecord } from "@/types";

function methodLabel(m: string) {
  const u = m.toLowerCase();
  if (u === "qr") return "QR";
  if (u === "manual") return "Manual";
  if (u === "admin") return "Admin";
  return m;
}

export function RecentActivity({
  records,
  daysToShow = 7,
}: {
  records: AttendanceRecord[];
  daysToShow?: number;
}) {
  const today = new Date();
  const days: { date: Date; record?: AttendanceRecord }[] = [];
  for (let i = 0; i < daysToShow; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = format(d, "yyyy-MM-dd");
    const rec = records.find((r) => r.date === iso);
    days.push({ date: d, record: rec });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h3 className="font-display text-base font-semibold text-slate-900">
        Recent Activity
      </h3>
      <ul className="mt-4 space-y-0 divide-y divide-slate-100">
        {days.map(({ date, record }) => {
          const present = !!record;
          return (
            <li
              key={date.toISOString()}
              className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-slate-600">
                  {format(date, "MMM d, yyyy")}
                </p>
                <p className="text-xs text-slate-600">{format(date, "EEEE")}</p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {present ? (
                  <span className="badge-present">Present</span>
                ) : (
                  <span className="badge-absent">Absent</span>
                )}
                {present && (
                  <>
                    <span className="text-xs text-slate-600">
                      {format(parseISO(record!.checked_in_at), "h:mm a")}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-slate-700">
                      {methodLabel(record!.method)}
                    </span>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
