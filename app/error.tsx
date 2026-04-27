"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-slate-600 mb-6">{error.message || "Unexpected error"}</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
