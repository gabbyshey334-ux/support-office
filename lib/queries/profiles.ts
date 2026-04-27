import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return (data as Profile) ?? null;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  return (data as Profile) ?? null;
}

export async function getAllMembers(): Promise<Profile[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Profile[]) ?? [];
}

export async function getApprovedMembers(): Promise<Profile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("account_status", "approved")
    .order("full_name", { ascending: true });
  if (error) {
    console.error("[getApprovedMembers]", error.message, error.code);
    return [];
  }
  return (data as Profile[]) ?? [];
}

export async function getPendingMembers(): Promise<Profile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("account_status", "pending")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[getPendingMembers]", error.message, error.code);
    return [];
  }
  return (data as Profile[]) ?? [];
}

export async function countPendingMembers(): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("account_status", "pending");
  if (error) {
    console.error("[countPendingMembers]", error.message, error.code);
    return 0;
  }
  return count ?? 0;
}

export async function adminExists(): Promise<boolean> {
  const supabase = createClient();
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");
  return (count ?? 0) > 0;
}
