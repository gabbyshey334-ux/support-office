import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { getTodayAttendanceForUser } from "@/lib/queries/attendance";
import { QRCodeDisplay } from "@/components/attendance/QRCodeDisplay";

export const metadata: Metadata = { title: "My QR" };
export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  const today = await getTodayAttendanceForUser(profile.id);

  return (
    <div className="fade-up space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">
          My QR code
        </h1>
        <p className="mt-1 text-sm text-slate-600 md:text-base">
          Present this code so an administrator can record your attendance. You
          cannot mark yourself present from this app.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 lg:items-start">
        <QRCodeDisplay
          userId={profile.id}
          fullName={profile.full_name}
          team={profile.team}
          avatarUrl={profile.avatar_url}
        />

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            How attendance works
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Only admins can scan your QR or otherwise record you as present.</li>
            <li>
              After you are marked present, you will see today&apos;s status on your
              dashboard and may receive a WhatsApp confirmation.
            </li>
            <li>
              If you are not showing as present yet, check with an admin at your
              session.
            </li>
          </ul>
          {today && (
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              You are already recorded for today. Thank you for showing up.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
