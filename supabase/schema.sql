-- ============================================================
-- Support Office — FHG & Neolife Attendance System
-- Supabase database schema (incremental / greenfield)
--
-- For a FULL wipe + recreate (drops all data), use instead:
--   supabase/reset_and_create.sql
--
-- Run in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- ---------------- PROFILES ----------------
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  sponsor_name text not null,
  upline_name text not null,
  phone_whatsapp text not null,
  date_of_birth date not null,
  status text not null check (status in (
    'newbie','probie','pro','distributor','manager','senior_managers'
  )),
  team text not null default 'Support Office',
  role text not null default 'member' check (role in ('admin','member')),
  account_status text not null default 'pending'
    check (account_status in ('pending','approved','rejected')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------- ATTENDANCE ----------------
-- Only admins may insert/update/delete (RLS). Members read their own rows.
create table if not exists attendance (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null default current_date,
  checked_in_at timestamptz default now(),
  method text not null check (method in ('qr','manual','admin')),
  marked_by uuid references profiles(id),
  notes text,
  unique(user_id, date)
);

-- ---------------- NOTIFICATIONS ----------------
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  type text not null,
  recipient_id uuid references profiles(id),
  message text not null,
  sent_at timestamptz default now(),
  status text default 'sent'
);

-- ---------------- RLS helper (avoids infinite recursion on profiles) ----------------
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

-- ---------------- ROW LEVEL SECURITY ----------------
alter table profiles enable row level security;
alter table attendance enable row level security;
alter table notifications enable row level security;

-- Profiles
drop policy if exists "read own profile" on profiles;
create policy "read own profile" on profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists "admin read all profiles" on profiles;
create policy "admin read all profiles" on profiles
  for select to authenticated
  using (public.support_office_is_admin());

drop policy if exists "admin manage profiles" on profiles;
create policy "admin manage profiles" on profiles
  for all to authenticated
  using (public.support_office_is_admin())
  with check (public.support_office_is_admin());

drop policy if exists "insert own profile on register" on profiles;
create policy "insert own profile on register" on profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "update own profile" on profiles;
create policy "update own profile" on profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Attendance: members SELECT own only; admins ALL (no member self-insert)
drop policy if exists "read own attendance" on attendance;
create policy "read own attendance" on attendance
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "insert own attendance" on attendance;

drop policy if exists "admin manage attendance" on attendance;
create policy "admin manage attendance" on attendance
  for all to authenticated
  using (public.support_office_is_admin())
  with check (public.support_office_is_admin());

-- Notifications: admins only
drop policy if exists "admin manage notifications" on notifications;
create policy "admin manage notifications" on notifications
  for all to authenticated
  using (public.support_office_is_admin())
  with check (public.support_office_is_admin());

-- ---------------- REALTIME ----------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'attendance'
  ) then
    execute 'alter publication supabase_realtime add table attendance';
  end if;
end$$;

-- ---------------- STORAGE ----------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar public read" on storage.objects;
create policy "Avatar public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Avatar authenticated upload" on storage.objects;
create policy "Avatar authenticated upload"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

drop policy if exists "Avatar owner update" on storage.objects;
create policy "Avatar owner update"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Avatar owner delete" on storage.objects;
create policy "Avatar owner delete"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- ---------------- INDEXES ----------------
create index if not exists idx_attendance_user_date on attendance(user_id, date);
create index if not exists idx_attendance_date on attendance(date);
create index if not exists idx_profiles_role on profiles(role);
create index if not exists idx_profiles_account_status on profiles(account_status);
