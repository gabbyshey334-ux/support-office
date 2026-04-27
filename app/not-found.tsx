import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SupportOfficeWordmark } from "@/components/ui/SupportOfficeWordmark";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex justify-center">
          <SupportOfficeWordmark className="text-[2rem] leading-none text-slate-900 sm:text-[2.35rem]" />
        </div>
        <h1 className="text-4xl font-semibold mb-2">404</h1>
        <p className="text-slate-600 mb-6">
          The page you’re looking for doesn’t exist.
        </p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
