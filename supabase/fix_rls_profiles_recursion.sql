-- Fix: GET /profiles ... 500 — RLS policies that subquery `profiles` recurse on every
-- `profiles` row read. Replace with a SECURITY DEFINER helper (reads as definer).
--
-- Run once in Supabase → SQL Editor.

create or replace function public.support_office_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

revoke all on function public.support_office_is_admin() from public;
grant execute on function public.support_office_is_admin() to authenticated;
grant execute on function public.support_office_is_admin() to service_role;

-- Profiles
drop policy if exists "admin read all profiles" on public.profiles;
create policy "admin read all profiles" on public.profiles
  for select to authenticated
  using (public.support_office_is_admin());

drop policy if exists "admin manage profiles" on public.profiles;
create policy "admin manage profiles" on public.profiles
  for all to authenticated
  using (public.support_office_is_admin())
  with check (public.support_office_is_admin());

-- Attendance
drop policy if exists "admin manage attendance" on public.attendance;
create policy "admin manage attendance" on public.attendance
  for all to authenticated
  using (public.support_office_is_admin())
  with check (public.support_office_is_admin());

-- Notifications
drop policy if exists "admin manage notifications" on public.notifications;
create policy "admin manage notifications" on public.notifications
  for all to authenticated
  using (public.support_office_is_admin())
  with check (public.support_office_is_admin());
