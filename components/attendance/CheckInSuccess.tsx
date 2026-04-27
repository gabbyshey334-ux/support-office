"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

export function CheckInSuccess({
  name,
  time,
  onDone,
}: {
  name: string;
  time: string;
  onDone: () => void;
}) {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#1A56DB", "#059669", "#3B82F6"],
    });
  }, []);

  let timeStr: string;
  try {
    timeStr = format(parseISO(time), "h:mm a · EEE, MMM d");
  } catch {
    timeStr = time;
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-2xl border border-green-200 p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center"
      >
        <Check className="h-9 w-9" strokeWidth={3} />
      </motion.div>
      <h3 className="text-xl font-semibold text-slate-900">Checked in!</h3>
      <p className="mt-1 text-slate-600">
        <span className="font-medium">{name}</span>
      </p>
      <p className="text-sm text-slate-500 mt-1">{timeStr}</p>
      <Button onClick={onDone} className="mt-5">
        Done
      </Button>
    </motion.div>
  );
}
