"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Edit, Save, Upload, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import {
  profileUpdateSchema,
  passwordChangeSchema,
  type ProfileUpdateValues,
  type PasswordChangeValues,
} from "@/lib/validations";
import { getInitials, formatDate } from "@/lib/utils";
import { NEOLIFE_STATUS_LABELS, type Profile } from "@/types";

export function ProfileView({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);

  const form = useForm<ProfileUpdateValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      phone_whatsapp: profile.phone_whatsapp,
      team: profile.team,
      avatar_url: profile.avatar_url ?? "",
    },
  });

  const passwordForm = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const onSave = (values: ProfileUpdateValues) => {
    startTransition(async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          phone_whatsapp: values.phone_whatsapp,
          team: values.team,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Profile updated");
      setEditing(false);
      router.refresh();
    });
  };

  const onChangePassword = (values: PasswordChangeValues) => {
    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({
        password: values.new_password,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Password changed");
      passwordForm.reset();
    });
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${profile.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: false });
    if (upErr) {
      toast.error(upErr.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
    toast.success("Avatar uploaded — save to apply");
  };

  return (
    <div className="fade-up max-w-3xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your personal information.
          </p>
        </div>
        {!editing && (
          <Button
            variant="outline"
            onClick={() => setEditing(true)}
            className="rounded-xl border-slate-300 font-semibold hover:bg-slate-50"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-20 w-20">
            {avatarUrl && <AvatarImage src={avatarUrl} />}
            <AvatarFallback className="text-xl">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xl font-semibold">{profile.full_name}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge variant="approved">{profile.account_status}</Badge>
              <Badge variant="blue">
                {NEOLIFE_STATUS_LABELS[profile.status]}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Joined {formatDate(profile.created_at)}
            </p>
          </div>
        </div>

        {editing && (
          <div className="mb-4">
            <Label className="block mb-2">Avatar</Label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-blue-600">
              {uploading ? <Spinner /> : <Upload className="h-4 w-4" />}
              Choose image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarChange}
              />
            </label>
          </div>
        )}

        <form
          onSubmit={form.handleSubmit(onSave)}
          className="grid sm:grid-cols-2 gap-4"
        >
          <Field label="Email">
            <Input value={"—"} readOnly disabled className="opacity-70" />
            <p className="text-xs text-slate-400 mt-1">Manage email via support</p>
          </Field>

          <Field label="Phone (WhatsApp)">
            <Input
              {...form.register("phone_whatsapp")}
              disabled={!editing}
            />
          </Field>

          <Field label="Date of Birth">
            <Input value={profile.date_of_birth} readOnly disabled />
          </Field>

          <Field label="Team">
            <Input {...form.register("team")} disabled={!editing} />
          </Field>

          <Field label="Sponsor">
            <Input value={profile.sponsor_name} readOnly disabled />
          </Field>

          <Field label="Upline">
            <Input value={profile.upline_name} readOnly disabled />
          </Field>

          <Field label="Neolife Status">
            <Input
              value={NEOLIFE_STATUS_LABELS[profile.status]}
              readOnly
              disabled
            />
          </Field>

          {editing && (
            <div className="sm:col-span-2 flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  form.reset();
                  setAvatarUrl(profile.avatar_url);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Spinner /> : <><Save className="h-4 w-4 mr-2" /> Save</>}
              </Button>
            </div>
          )}
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-slate-900">
          <Lock className="h-5 w-5 text-slate-600" /> Change Password
        </h3>
        <Separator className="my-4" />
        <form
          onSubmit={passwordForm.handleSubmit(onChangePassword)}
          className="grid sm:grid-cols-2 gap-4"
        >
          <Field label="New Password">
            <Input
              type="password"
              {...passwordForm.register("new_password")}
            />
            {passwordForm.formState.errors.new_password && (
              <p className="text-xs text-red-600 mt-1">
                {passwordForm.formState.errors.new_password.message}
              </p>
            )}
          </Field>
          <Field label="Confirm Password">
            <Input
              type="password"
              {...passwordForm.register("confirm_password")}
            />
            {passwordForm.formState.errors.confirm_password && (
              <p className="text-xs text-red-600 mt-1">
                {passwordForm.formState.errors.confirm_password.message}
              </p>
            )}
          </Field>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? <Spinner /> : "Update Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
