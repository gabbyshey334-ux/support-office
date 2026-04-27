"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminAddMemberSchema,
  type AdminAddMemberValues,
} from "@/lib/validations";
import {
  addMemberAction,
  updateMemberAction,
} from "@/lib/actions/admin";
import { MEMBER_STATUS_OPTIONS, type Profile } from "@/types";

const inputClass =
  "h-11 rounded-xl border-slate-300 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  member?: Profile | null;
}

export function MemberSlideOver({ open, onOpenChange, member }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = !!member;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AdminAddMemberValues>({
    resolver: zodResolver(adminAddMemberSchema),
    defaultValues: {
      full_name: member?.full_name ?? "",
      email: "",
      password: "",
      date_of_birth: member?.date_of_birth ?? "",
      phone_whatsapp: member?.phone_whatsapp ?? "",
      sponsor_name: member?.sponsor_name ?? "",
      upline_name: member?.upline_name ?? "",
      team: member?.team ?? "Support Office",
      status: member?.status ?? "newbie",
    },
  });

  const status = watch("status");

  const onSubmit = (values: AdminAddMemberValues) => {
    startTransition(async () => {
      let res;
      if (isEdit && member) {
        res = await updateMemberAction(member.id, {
          full_name: values.full_name,
          phone_whatsapp: values.phone_whatsapp,
          sponsor_name: values.sponsor_name,
          upline_name: values.upline_name,
          team: values.team,
          status: values.status,
        });
      } else {
        res = await addMemberAction(values);
      }
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(isEdit ? "Member updated" : "Member created");
      onOpenChange(false);
      reset();
      router.refresh();
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-[480px]">
        <SheetHeader className="border-b border-slate-200 px-6 py-5">
          <SheetTitle className="font-display text-xl font-semibold text-slate-900">
            {isEdit ? "Edit Member" : "Add New Member"}
          </SheetTitle>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 space-y-4 overflow-y-auto px-6 py-6"
          id="member-form"
        >
          <Field label="Full Name" error={errors.full_name?.message}>
            <Input {...register("full_name")} className={inputClass} />
          </Field>

          {!isEdit && (
            <>
              <Field label="Email" error={errors.email?.message}>
                <Input type="email" {...register("email")} className={inputClass} />
              </Field>
              <Field label="Initial Password" error={errors.password?.message}>
                <Input
                  type="password"
                  {...register("password")}
                  className={inputClass}
                />
              </Field>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Date of Birth"
              error={errors.date_of_birth?.message}
            >
              <Input
                type="date"
                {...register("date_of_birth")}
                className={inputClass}
              />
            </Field>
            <Field label="Phone" error={errors.phone_whatsapp?.message}>
              <Input {...register("phone_whatsapp")} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Sponsor" error={errors.sponsor_name?.message}>
              <Input {...register("sponsor_name")} className={inputClass} />
            </Field>
            <Field label="Upline" error={errors.upline_name?.message}>
              <Input {...register("upline_name")} className={inputClass} />
            </Field>
          </div>

          <Field label="Team">
            <Input {...register("team")} className={inputClass} />
          </Field>

          <Field label="Status">
            <Select
              value={status}
              onValueChange={(v) =>
                setValue("status", v as AdminAddMemberValues["status"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEMBER_STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </form>

        <SheetFooter className="mt-auto border-t border-slate-200 bg-white">
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="member-form"
            disabled={pending}
            className="rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700"
          >
            {pending ? <Spinner /> : isEdit ? "Save" : "Create member"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
