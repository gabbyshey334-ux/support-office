"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarX } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";

interface FeedItem {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  team: string;
  method: "qr" | "manual" | "admin";
  checked_in_at: string;
}

function methodChip(method: string) {
  const m = method.toLowerCase();
  if (m === "qr")
    return "rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-800";
  if (m === "admin")
    return "rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900";
  return "rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700";
}

export function LiveCheckInFeed({ initial }: { initial: FeedItem[] }) {
  const [items, setItems] = useState<FeedItem[]>(initial);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("attendance-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "attendance" },
        async (payload) => {
          const rec = payload.new as {
            id: string;
            user_id: string;
            method: "qr" | "manual" | "admin";
            checked_in_at: string;
          };
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, team")
            .eq("id", rec.user_id)
            .single();
          if (!profile) return;
          setItems((curr) =>
            [
              {
                id: rec.id,
                user_id: rec.user_id,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                team: profile.team,
                method: rec.method,
                checked_in_at: rec.checked_in_at,
              },
              ...curr,
            ].slice(0, 12)
          );
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fade-up-2 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-base font-semibold text-slate-900">
          Live Check-ins
        </h3>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 pulse-dot" />
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
            Today
          </span>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <CalendarX className="h-12 w-12 text-slate-400" />
          <p className="mt-3 font-display text-sm font-semibold text-slate-800">
            No check-ins yet today
          </p>
          <p className="mt-1 max-w-xs text-sm text-slate-600">
            When an admin records someone as present, they appear here in real
            time.
          </p>
        </div>
      ) : (
        <ul className="space-y-1">
          <AnimatePresence initial={false}>
            {items.map((it) => (
              <motion.li
                key={it.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-9 w-9 border border-slate-100">
                    {it.avatar_url && <AvatarImage src={it.avatar_url} />}
                    <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
                      {getInitials(it.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {it.full_name}
                    </p>
                    <p className="truncate text-xs text-slate-600">{it.team}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={cn(methodChip(it.method))}>{it.method}</span>
                  <span className="hidden text-xs text-slate-600 sm:inline">
                    {format(parseISO(it.checked_in_at), "h:mm a")}
                  </span>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

export type { FeedItem };
