"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScan: (decodedText: string) => Promise<void> | void;
  isProcessing?: boolean;
}

export default function QRScanner({ onScan, isProcessing }: QRScannerProps) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const elementId = "qr-scanner-region";

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    async function start() {
      setError(null);
      try {
        const scanner = new Html5Qrcode(elementId, { verbose: false });
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decodedText) => {
            if (cancelled) return;
            try {
              await scanner.stop();
            } catch {
              // ignore
            }
            await onScan(decodedText);
            setActive(false);
          },
          () => {
            // ignore decode failures
          }
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to start camera";
        setError(message);
        setActive(false);
      }
    }

    start();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s) {
        s.stop().catch(() => {});
        s.clear();
      }
    };
  }, [active, onScan]);

  if (!active) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Camera className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">
          Scan to Check In
        </h3>
        <p className="max-w-sm text-sm text-slate-500">
          Use your camera to scan your QR code and mark today&apos;s attendance.
        </p>
        <Button
          onClick={() => setActive(true)}
          disabled={isProcessing}
          className="mt-2"
        >
          <Camera className="h-4 w-4" />
          Open Scanner
        </Button>
        {error && (
          <p className="text-xs text-danger-600">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-black">
      <div id={elementId} className="aspect-square w-full" />
      <button
        onClick={() => setActive(false)}
        className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow"
        aria-label="Close scanner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
