-- Support Office - FHG & Neolife Attendance System
-- Run this in the Supabase SQL editor.

-- PROFILES (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  username text unique not null,
  phone_whatsapp text,
  role text not null check (role in ('admin','leader','member')),
  team text not null default 'Support Office',
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ATTENDANCE
create table if not exists attendance (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  date date not null default current_date,
  checked_in_at timestamptz default now(),
  method text not null check (method in ('qr','manual','admin')),
  marked_by uuid references profiles(id),
  unique(user_id, date)
);

create index if not exists attendance_date_idx on attendance(date);
create index if not exists attendance_user_id_idx on attendance(user_id);

-- ROW LEVEL SECURITY
alter table profiles enable row level security;
alter table attendance enable row level security;

-- Members can read their own profile.
drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles for select using (auth.uid() = id);

-- Admins and leaders can read all profiles.
drop policy if exists "admin leader read profiles" on profiles;
create policy "admin leader read profiles" on profiles for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role in ('admin','leader')
    )
  );

-- Only admins can insert/update/delete profiles.
drop policy if exists "admin manage profiles" on profiles;
create policy "admin manage profiles" on profiles for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Members can insert their own attendance.
drop policy if exists "self checkin" on attendance;
create policy "self checkin" on attendance for insert
  with check (auth.uid() = user_id);

-- Members can read their own attendance.
drop policy if exists "own attendance" on attendance;
create policy "own attendance" on attendance for select
  using (auth.uid() = user_id);

-- Admins and leaders read all attendance.
drop policy if exists "admin read all" on attendance;
create policy "admin read all" on attendance for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role in ('admin','leader')
    )
  );

-- Admins can insert attendance for anyone.
drop policy if exists "admin mark" on attendance;
create policy "admin mark" on attendance for insert
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Realtime: enable for the attendance table so the Today page updates live.
alter publication supabase_realtime add table attendance;
