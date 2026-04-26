import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { checkAdminStatus } from "./actions";
import AdminSetupForm from "./AdminSetupForm";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "First-time setup — Support Office",
};

export default async function AdminSetupPage() {
  const status = await checkAdminStatus();
  if (status.configured && status.exists) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-50 px-4 py-12">
      <div className="w-full max-w-[460px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-sm">
              SO
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
              First-time setup
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create the very first admin for the Support Office system.
            </p>
          </div>

          {status.configured ? (
            <>
              <div className="mt-6 rounded-xl border border-warning-100 bg-warning-50/70 p-3 text-xs text-warning-700">
                This page works exactly once. As soon as an admin exists, it
                permanently redirects to <strong>/login</strong>. Disable or
                remove this route after you finish setup for extra safety.
              </div>
              <AdminSetupForm />
            </>
          ) : (
            <div className="mt-6 flex gap-3 rounded-xl border border-danger-100 bg-danger-50/70 p-4 text-sm text-danger-700">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Supabase is not configured</p>
                <p className="mt-1 text-xs">
                  {status.error ??
                    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local, run supabase/schema.sql, then refresh."}
                </p>
              </div>
            </div>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} FHG &amp; Neolife · Support Office
        </p>
      </div>
    </div>
  );
}
