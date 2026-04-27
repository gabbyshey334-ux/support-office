"use client";

import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  isSameMonth,
  isAfter,
  startOfDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function AttendanceCalendar({
  presentDates,
  joinedAt,
}: {
  presentDates: string[];
  joinedAt: string;
  month?: Date;
}) {
  const [cursor, setCursor] = useState(() => new Date());
  const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const set = new Set(presentDates);
  const today = startOfDay(new Date());
  const joined = startOfDay(new Date(joinedAt));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-slate-900">
          This Month
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">
            {format(cursor, "MMMM yyyy")}
          </span>
          <div className="flex items-center rounded-lg border border-slate-200 bg-white">
            <button
              type="button"
              className="p-1.5 text-slate-600 transition hover:bg-slate-50 active:scale-[0.95]"
              aria-label="Previous month"
              onClick={() => setCursor(subMonths(cursor, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-1.5 text-slate-600 transition hover:bg-slate-50 active:scale-[0.95]"
              aria-label="Next month"
              onClick={() => setCursor(addMonths(cursor, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center sm:gap-2">
        {WEEKDAYS.map((l) => (
          <div
            key={l}
            className="pb-2 text-[11px] font-medium uppercase tracking-wide text-slate-600"
          >
            {l}
          </div>
        ))}
        {days.map((d) => {
          const iso = format(d, "yyyy-MM-dd");
          const present = set.has(iso);
          const future = isAfter(d, today);
          const beforeJoin = d < joined;
          const inMonth = isSameMonth(d, cursor);
          const isTodayCell = isToday(d);

          let cellClass =
            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold mx-auto";
          if (!inMonth || beforeJoin) {
            cellClass += " text-slate-300";
          } else if (future) {
            cellClass += " text-slate-400 bg-transparent";
          } else if (present) {
            cellClass += " bg-blue-600 text-white";
          } else {
            cellClass += " bg-red-50 text-red-500";
          }

          if (isTodayCell) {
            if (!present && !future && inMonth && !beforeJoin) {
              cellClass +=
                " ring-2 ring-blue-600 ring-offset-2 ring-offset-white";
            } else if (present) {
              cellClass +=
                " ring-2 ring-blue-600 ring-offset-2 ring-offset-white";
            } else {
              cellClass +=
                " ring-2 ring-blue-600 ring-offset-2 ring-offset-white";
            }
          }

          return (
            <div key={iso} className="flex min-h-[2rem] items-center justify-center">
              <div className={cn(cellClass)}>{format(d, "d")}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
