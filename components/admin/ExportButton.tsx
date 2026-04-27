"use client";

import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function ExportButton({ from, to }: { from: string; to: string }) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/export?from=${from}&to=${to}`, {
        method: "GET",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `support-office-attendance-${from}-to-${to}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className="rounded-xl bg-green-600 font-semibold text-white hover:bg-green-700 active:scale-[0.98] disabled:opacity-70"
    >
      {loading ? (
        <Spinner />
      ) : (
        <FileSpreadsheet className="mr-2 h-4 w-4" />
      )}
      Export to Excel
    </Button>
  );
}
