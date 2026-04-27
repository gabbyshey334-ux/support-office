import { cn } from "@/lib/utils";

/**
 * Brand wordmark — uses Allison (Google Fonts), chosen to match the thin
 * signature script used for “Support Office” on FHG / Support Office flyers.
 */
export function SupportOfficeWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-wordmark font-normal not-italic tracking-normal",
        className
      )}
    >
      Support Office
    </span>
  );
}
