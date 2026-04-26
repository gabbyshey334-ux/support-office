"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Profile } from "@/types";

interface QRCodeDisplayProps {
  profile: Profile;
  size?: number;
}

export default function QRCodeDisplay({ profile, size = 240 }: QRCodeDisplayProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  function downloadPNG() {
    const canvas = wrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${profile.username}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Card className="flex flex-col items-center gap-4 p-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-wider text-slate-500">
          Your personal check-in code
        </p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900">
          {profile.full_name}
        </h3>
      </div>
      <div
        ref={wrapperRef}
        className="rounded-2xl border-4 border-brand-600/10 bg-white p-4"
      >
        <QRCodeCanvas
          value={profile.id}
          size={size}
          level="H"
          marginSize={1}
          fgColor="#0f172a"
        />
      </div>
      <p className="text-xs text-slate-500">
        Scan this code at the office to mark today&apos;s attendance
      </p>
      <Button onClick={downloadPNG} variant="outline" size="sm">
        <Download className="h-4 w-4" />
        Download PNG
      </Button>
    </Card>
  );
}
