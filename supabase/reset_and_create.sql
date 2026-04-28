-- ============================================================
-- SUPPORT OFFICE — FULL DATABASE RESET + FRESH SCHEMA
-- ============================================================
-- WARNING: This deletes ALL rows in profiles, attendance, notifications,
--          and related RLS policies. Auth users (auth.users) are NOT deleted.
--
-- STORAGE FILES: Supabase forbids SQL DELETE on storage.objects (use Storage API
-- or Dashboard). To wipe avatar files: Dashboard → Storage → avatars → select
-- all → delete. Or leave them; DB reset clears profile.avatar_url anyway.
--
-- Run in: Supabase Dashboard → SQL Editor → New query
-- Order: run as a single script. Review before production.
-- ============================================================

begin;

-- ----------------------------------------------------------------
-- 1. REALTIME — remove attendance from publication (if present)
-- ----------------------------------------------------------------
do $$
begin
  if exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'attendance'
  ) then
    execute 'alter publication supabase_realtime drop table public.attendance';
  end if;
end$$;

-- ----------------------------------------------------------------
-- 2. STORAGE — drop policies (do NOT delete storage.objects / buckets in SQL;
--    Supabase raises 42501: Direct deletion from storage tables is not allowed)
-- ----------------------------------------------------------------
drop policy if exists "Avatar public read" on storage.objects;
drop policy if exists "Avatar authenticated upload" on storage.objects;
drop policy if exists "Avatar owner update" on storage.objects;
drop policy if exists "Avatar owner delete" on storage.objects;

-- ----------------------------------------------------------------
-- 3. PUBLIC TABLES — drop (FK order: child → parent)
-- ----------------------------------------------------------------
drop table if exists public.attendance cascade;
drop table if exists public.notifications cascade;
drop table if exists public.profiles cascade;

-- ----------------------------------------------------------------
-- 4. PROFILES
-- ----------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users (id) on delete cascade primary key,
  full_name text not null,
  sponsor_name text not null,
  upline_name text not null,
  phone text not null,
  date_of_birth date not null,
  status text not null
    check (status in (
      'newbie','probie','pro','distributor','manager','senior_managers'
    )),
  team text not null default 'Support Office',
  role text not null default 'member' check (role in ('admin','member')),
  account_status text not null default 'pending'
    check (account_status in ('pending','approved','rejected')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- 5. ATTENDANCE (only admins insert/update/delete via RLS)
-- ----------------------------------------------------------------
create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null default current_date,
  checked_in_at timestamptz not null default now(),
  method text not null check (method in ('qr','manual','admin')),
  marked_by uuid references public.profiles (id),
  notes text,
  unique (user_id, date)
);

comment on table public.attendance is
  'Rows are created only by administrators (RLS). marked_by should reference the admin who recorded attendance.';

-- ----------------------------------------------------------------
-- 6. NOTIFICATIONS (admin / server logging)
-- ----------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  recipient_id uuid references public.profiles (id),
  message text not null,
  sent_at timestamptz not null default now(),
  status text default 'sent'
);

-- ----------------------------------------------------------------
-- 7. RLS helper — must run before profiles policies (avoids recursion on profiles)
-- ----------------------------------------------------------------
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

-- ----------------------------------------------------------------
-- 7b. ROW LEVEL SECURITY — PROFILES
-- ----------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists "admin read all profiles" on public.profiles;
create policy "admin read all profiles" on public.profiles
  for select to authenticated
  using (public.support_office_is_admin());

drop policy if exists "insert own profile on register" on public.profiles;
create policy "insert own profile on register" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "admin manage profiles" on public.profiles;
create policy "admin manage profiles" on public.profiles
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ----------------------------------------------------------------
-- 8. ROW LEVEL SECURITY — ATTENDANCE (members: read-only own rows)
-- ----------------------------------------------------------------
alter table public.attendance enable row level security;

drop policy if exists "read own attendance" on public.attendance;
create policy "read own attendance" on public.attendance
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "insert own attendance" on public.attendance;
drop policy if exists "admin manage attendance" on public.attendance;
drop policy if exists "admin select all attendance" on public.attendance;
drop policy if exists "admin insert attendance" on public.attendance;
drop policy if exists "admin update attendance" on public.attendance;
drop policy if exists "admin delete attendance" on public.attendance;

-- Admins: full access (insert/update/delete/select all)
create policy "admin manage attendance" on public.attendance
  for all to authenticated
  using (public.support_office_is_admin())
  with check (public.support_office_is_admin());

-- Members: NO insert/update/delete policies — cannot mark attendance themselves

-- ----------------------------------------------------------------
-- 9. ROW LEVEL SECURITY — NOTIFICATIONS
-- ----------------------------------------------------------------
alter table public.notifications enable row level security;

drop policy if exists "admin manage notifications" on public.notifications;
create policy "admin manage notifications" on public.notifications
  for all to authenticated
  using (public.support_office_is_admin())
  with check (public.support_office_is_admin());

-- ----------------------------------------------------------------
-- 10. INDEXES
-- ----------------------------------------------------------------
create index idx_attendance_user_date on public.attendance (user_id, date);
create index idx_attendance_date on public.attendance (date);
create index idx_profiles_role on public.profiles (role);
create index idx_profiles_account_status on public.profiles (account_status);

-- ----------------------------------------------------------------
-- 11. REALTIME — re-add attendance (optional; for live admin feed)
-- ----------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'attendance'
  ) then
    execute 'alter publication supabase_realtime add table public.attendance';
  end if;
end$$;

-- ----------------------------------------------------------------
-- 12. STORAGE — avatars bucket + policies
-- ----------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar public read"
  on storage.objects for select to public
  using (bucket_id = 'avatars');

create policy "Avatar authenticated upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars');

create policy "Avatar owner update"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Avatar owner delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

commit;

-- ============================================================
-- AFTER RUNNING: create at least one admin in auth + profiles
-- (register first user via app, then in SQL:)
--
-- update public.profiles
-- set role = 'admin', account_status = 'approved'
-- where id = '<your-user-uuid>';
-- ============================================================
