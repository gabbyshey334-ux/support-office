"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Loader2, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { sendDailySummaryAction } from "@/lib/actions/admin";
import { toast } from "sonner";
import type { Profile } from "@/types";

const titles: { prefix: string; exact?: boolean; title: string; sub: string }[] = [
  { prefix: "/admin/members", title: "Members", sub: "Directory & roles" },
  { prefix: "/admin/attendance", title: "Attendance", sub: "Daily presence" },
  { prefix: "/admin/reports", title: "Reports", sub: "Trends & exports" },
  { prefix: "/admin/approvals", title: "Approvals", sub: "Pending registrations" },
  { prefix: "/admin", exact: true, title: "Overview", sub: "Team snapshot" },
];

export function AdminTopbar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const [sending, setSending] = useState(false);

  const meta =
    titles.find((t) =>
      t.exact ? pathname === t.prefix : pathname.startsWith(t.prefix)
    ) ?? {
      prefix: "/admin",
      title: "Admin",
      sub: "Support Office",
    };

  const onSendSummary = async () => {
    setSending(true);
    const res = await sendDailySummaryAction();
    setSending(false);
    if (!res.ok) toast.error(res.error);
    else toast.success(`Summary sent — ${res.presentCount} present`);
  };

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between gap-4 px-4 md:px-6">
        <div className="min-w-0">
          <h1 className="truncate font-display text-lg font-semibold text-slate-900">
            {meta.title}
          </h1>
          <p className="truncate text-[13px] text-slate-600">{meta.sub}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onSendSummary}
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-2.5 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:px-3 sm:text-xs"
          >
            {sending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : null}
            <span className="hidden sm:inline">Send WhatsApp Summary</span>
            <span className="sm:hidden">WhatsApp</span>
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 active:scale-[0.98]"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <Avatar className="h-9 w-9 border border-slate-200">
            {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
            <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
