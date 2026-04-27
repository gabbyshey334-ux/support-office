"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";
import { CheckInSuccess } from "./CheckInSuccess";

export function QRScanner({ onRecorded }: { onRecorded?: () => void }) {
  const containerId = "qr-scanner-region";
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState<{
    name: string;
    time: string;
  } | null>(null);
  const scannerRef = useRef<unknown>(null);

  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopScanner = async () => {
    const inst = scannerRef.current as { clear?: () => Promise<void> } | null;
    if (inst?.clear) {
      try {
        await inst.clear();
      } catch {
        // no-op
      }
    }
    scannerRef.current = null;
    setScanning(false);
  };

  const startScanner = async () => {
    setScanning(true);
    setSuccess(null);
    const { Html5QrcodeScanner } = await import("html5-qrcode");
    const scanner = new Html5QrcodeScanner(
      containerId,
      { fps: 10, qrbox: { width: 260, height: 260 } },
      false
    );
    scannerRef.current = scanner;
    scanner.render(
      async (decodedText) => {
        await scanner.clear();
        scannerRef.current = null;
        setScanning(false);
        await handleScan(decodedText);
      },
      () => {
        // ignore per-frame errors
      }
    );
  };

  const handleScan = async (decodedText: string) => {
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanned_user_id: decodedText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Check-in failed");
        return;
      }
      onRecorded?.();
      setSuccess({ name: data.name, time: data.time });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <CheckInSuccess
          name={success.name}
          time={success.time}
          onDone={() => setSuccess(null)}
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-display text-lg font-semibold text-slate-900">
        Scan member QR
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Scan a member&apos;s Support Office code to record them present for today.
        Only admins can use this.
      </p>

      {!scanning ? (
        <div className="mt-6 text-center">
          <div className="mx-auto aspect-square max-w-[280px] overflow-hidden rounded-xl bg-slate-900" />
          <button
            type="button"
            onClick={startScanner}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <Camera className="h-4 w-4" />
            Open Camera
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-900">Scanner active</p>
            <button
              type="button"
              onClick={stopScanner}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-slate-600 transition hover:bg-slate-100 active:scale-[0.98]"
            >
              <X className="h-4 w-4" />
              Stop
            </button>
          </div>
          <div
            id={containerId}
            className="mx-auto aspect-square max-w-[280px] overflow-hidden rounded-xl bg-slate-900"
          />
        </div>
      )}
    </div>
  );
}
