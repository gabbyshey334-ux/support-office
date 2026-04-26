"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "success" | "warning" | "danger";
  delay?: number;
}

const toneClasses: Record<
  NonNullable<StatsCardProps["tone"]>,
  { iconBg: string; iconText: string }
> = {
  default: { iconBg: "bg-brand-50", iconText: "text-brand-700" },
  success: { iconBg: "bg-success-50", iconText: "text-success-700" },
  warning: { iconBg: "bg-warning-50", iconText: "text-warning-700" },
  danger: { iconBg: "bg-danger-50", iconText: "text-danger-700" },
};

export default function StatsCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  delay = 0,
}: StatsCardProps) {
  const tones = toneClasses[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              tones.iconBg
            )}
          >
            <Icon className={cn("h-5 w-5", tones.iconText)} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
