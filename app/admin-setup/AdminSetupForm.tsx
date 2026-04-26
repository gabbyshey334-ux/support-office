"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { createFirstAdmin, type SetupResult } from "./actions";

const initialState: SetupResult = { ok: false };

export default function AdminSetupForm() {
  const [state, formAction] = useFormState(createFirstAdmin, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" required minLength={2} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="text-xs text-slate-400">At least 8 characters.</p>
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-xl border border-danger-100 bg-danger-50 p-3 text-xs text-danger-700"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Spinner /> Creating admin…
        </>
      ) : (
        <>
          <Shield className="h-4 w-4" />
          Create first admin
        </>
      )}
    </Button>
  );
}
