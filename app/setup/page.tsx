import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminExists } from "@/lib/queries/profiles";
import { SetupForm } from "@/components/auth/SetupForm";

export const metadata: Metadata = { title: "Initial Setup" };

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const exists = await adminExists();
  if (exists) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <SetupForm />
    </main>
  );
}
