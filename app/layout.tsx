import type { Metadata } from "next";
import { Sora, DM_Sans, JetBrains_Mono, Allison } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fontDisplay = Sora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-sora",
  display: "swap",
});

const fontBody = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

/** Thin signature script — closest free match to Support Office flyer wordmark */
const fontWordmark = Allison({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-allison",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Support Office — FHG & Neolife Attendance System",
    template: "%s · Support Office",
  },
  description:
    "The official attendance platform for FHG & Neolife Support Office members. Track your commitment and celebrate your consistency.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://support-office.app"
  ),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon", type: "image/png", sizes: "512x512" },
    ],
  },
  openGraph: {
    title: "Support Office — FHG & Neolife Attendance System",
    description:
      "Track attendance, build streaks, and stay accountable with your Neolife team.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} ${fontWordmark.variable}`}
    >
      <body className="min-h-screen antialiased bg-[var(--so-slate-50)] text-[var(--so-slate-900)] font-sans">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{ className: "rounded-xl font-sans" }}
        />
      </body>
    </html>
  );
}
