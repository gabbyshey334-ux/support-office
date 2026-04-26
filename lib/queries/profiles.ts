import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, Role } from "@/types";

export async function getCurrentProfile(
  supabase: SupabaseClient
): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) return null;
  return data as Profile;
}

export async function listProfiles(
  supabase: SupabaseClient,
  options: { team?: string; role?: Role; activeOnly?: boolean } = {}
): Promise<Profile[]> {
  let query = supabase.from("profiles").select("*").order("full_name");
  if (options.team) query = query.eq("team", options.team);
  if (options.role) query = query.eq("role", options.role);
  if (options.activeOnly) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Profile[];
}

export async function getProfileById(
  supabase: SupabaseClient,
  id: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Profile;
}

export async function updateProfile(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Profile>
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function setProfileActive(
  supabase: SupabaseClient,
  id: string,
  isActive: boolean
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw error;
}
