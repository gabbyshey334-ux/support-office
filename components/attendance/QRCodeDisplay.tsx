"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";
export function QRCodeDisplay({
  userId,
  fullName,
  team,
  avatarUrl: _avatarUrl,
}: {
  userId: string;
  fullName: string;
  team: string;
  avatarUrl?: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const download = () => {
    const canvas = ref.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fullName.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-display text-lg font-semibold text-slate-900">
        Your Check-In Code
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Show this to an admin — they record your attendance
      </p>

      <div className="mt-6 flex flex-col items-center">
        <div
          ref={ref}
          className="rounded-xl bg-blue-50 p-4"
        >
          <QRCodeCanvas
            value={userId}
            size={200}
            level="H"
            marginSize={1}
            fgColor="#1E4DB7"
          />
        </div>
        <p className="mt-4 text-center text-sm font-medium text-slate-800">
          {fullName}
        </p>
        <p className="text-center text-xs text-slate-600">{team}</p>
      </div>

      <button
        type="button"
        onClick={download}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-blue-600 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 active:scale-[0.98]"
      >
        <Download className="h-4 w-4" />
        Download QR Code
      </button>
    </div>
  );
}
