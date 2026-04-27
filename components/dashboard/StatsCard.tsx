"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  icon?: LucideIcon;
  color?: "blue" | "green" | "amber" | "red" | "slate";
  hint?: string;
  /** e.g. "+2 from last week" — positive green, negative red */
  change?: string;
  changePositive?: boolean;
  delay?: number;
  fadeClass?: string;
}

const colors = {
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  green: { bg: "bg-green-50", text: "text-green-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-600" },
  red: { bg: "bg-red-50", text: "text-red-600" },
  slate: { bg: "bg-slate-100", text: "text-slate-600" },
};

export function StatsCard({
  title,
  value,
  suffix = "",
  icon: Icon,
  color = "blue",
  hint,
  change,
  changePositive = true,
  delay = 0,
  fadeClass = "fade-up-0",
}: StatsCardProps) {
  const numeric = typeof value === "number" ? value : NaN;
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) =>
    Number.isInteger(numeric)
      ? Math.round(v).toLocaleString()
      : v.toFixed(1)
  );

  useEffect(() => {
    if (!inView || Number.isNaN(numeric)) return;
    const c = animate(mv, numeric, { duration: 1.1, ease: "easeOut", delay });
    return c.stop;
  }, [inView, numeric, mv, delay]);

  const c = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5",
        fadeClass
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-normal text-slate-600">{title}</p>
        {Icon && (
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              c.bg,
              c.text
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-[28px] font-bold leading-tight tracking-tight text-slate-900">
        {Number.isNaN(numeric) ? (
          <>
            {value}
            {suffix}
          </>
        ) : (
          <span ref={ref}>
            <motion.span>{text}</motion.span>
            {suffix}
          </span>
        )}
      </p>
      {change && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            changePositive ? "text-green-600" : "text-red-600"
          )}
        >
          {change}
        </p>
      )}
      {hint && !change && (
        <p className="mt-1 text-xs text-slate-600">{hint}</p>
      )}
    </motion.div>
  );
}
