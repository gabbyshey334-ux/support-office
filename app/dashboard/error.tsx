"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
      <h2 className="font-semibold text-lg">We hit a snag</h2>
      <p className="text-sm text-slate-600 mt-1">{error.message}</p>
      <Button onClick={reset} className="mt-4">
        Try again
      </Button>
    </div>
  );
}
