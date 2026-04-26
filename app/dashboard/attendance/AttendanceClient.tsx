"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Flame,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import QRScanner from "@/components/QRScanner";
import StatsCard from "@/components/StatsCard";
import AttendanceTable from "@/components/AttendanceTable";
import { Card } from "@/components/ui/card";
import type { Attendance, AttendanceStats, Profile, CheckInResult } from "@/types";
import { formatTime } from "@/lib/utils";

interface Props {
  profile: Profile;
  initialHistory: Attendance[];
  initialStats: AttendanceStats;
  initialTodayCheckIn: Attendance | null;
}

export default function AttendanceClient({
  profile,
  initialHistory,
  initialStats,
  initialTodayCheckIn,
}: Props) {
  const [history, setHistory] = useState<Attendance[]>(initialHistory);
  const [stats, setStats] = useState<AttendanceStats>(initialStats);
  const [todayCheckIn, setTodayCheckIn] = useState<Attendance | null>(
    initialTodayCheckIn
  );
  const [processing, setProcessing] = useState(false);
  const [recentResult, setRecentResult] = useState<CheckInResult | null>(null);

  async function handleScan(decoded: string) {
    setProcessing(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanned_id: decoded }),
      });
      const data = (await res.json()) as CheckInResult & {
        attendance?: Attendance;
      };
      if (!res.ok) {
        toast.error(data.message || "Check-in failed");
        return;
      }

      if (data.alreadyCheckedIn) {
        toast.info(data.message);
      } else {
        toast.success(data.message);
      }

      setRecentResult(data);
      if (data.attendance) {
        setTodayCheckIn(data.attendance);
        setHistory((prev) => {
          if (prev.some((p) => p.id === data.attendance!.id)) return prev;
          return [data.attendance!, ...prev];
        });
        setStats((prev) => ({
          ...prev,
          thisWeek: prev.thisWeek + 1,
          thisMonth: prev.thisMonth + 1,
          totalDays: prev.totalDays + 1,
        }));
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <QRCodeDisplay profile={profile} />

        <div className="space-y-4">
          {todayCheckIn ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="flex flex-col items-center gap-3 bg-success-50/60 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-success-600 text-white shadow-lg"
                >
                  <CheckCircle2 className="h-8 w-8" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-success-700">
                    You&apos;re marked present
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Checked in at {formatTime(todayCheckIn.checked_in_at)}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Method: {todayCheckIn.method.toUpperCase()}
                  </p>
                </div>
              </Card>
            </motion.div>
          ) : (
            <QRScanner onScan={handleScan} isProcessing={processing} />
          )}

          <AnimatePresence>
            {recentResult && !todayCheckIn && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600"
              >
                {recentResult.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="This week"
          value={stats.thisWeek}
          hint="Days present this week"
          icon={CalendarCheck2}
          tone="default"
          delay={0.05}
        />
        <StatsCard
          label="This month"
          value={stats.thisMonth}
          hint="Days present this month"
          icon={CalendarDays}
          tone="success"
          delay={0.1}
        />
        <StatsCard
          label="Current streak"
          value={`${stats.currentStreak}d`}
          hint="Consecutive days"
          icon={Flame}
          tone="warning"
          delay={0.15}
        />
        <StatsCard
          label="Total days"
          value={stats.totalDays}
          hint="All-time check-ins"
          icon={Trophy}
          tone="default"
          delay={0.2}
        />
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Your attendance history
        </h2>
        <AttendanceTable
          rows={history}
          emptyMessage="You haven't checked in yet. Scan your QR code to get started."
        />
      </div>
    </div>
  );
}
