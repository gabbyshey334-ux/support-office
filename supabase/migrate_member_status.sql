-- Run once on existing databases that still use the old Neolife-style status values.
-- Supabase SQL Editor → paste → run.

alter table public.profiles drop constraint if exists profiles_status_check;

update public.profiles
set status = case status
  when 'newbie' then 'newbie'
  when 'probie' then 'probie'
  when 'pro' then 'pro'
  when 'distributor' then 'distributor'
  when 'manager' then 'manager'
  when 'senior_managers' then 'senior_managers'
  when 'bronze' then 'probie'
  when 'silver' then 'pro'
  when 'gold' then 'distributor'
  when 'senior_gold' then 'manager'
  when 'senior_distributor' then 'distributor'
  when 'executive' then 'manager'
  when 'ruby' then 'manager'
  when 'emerald' then 'senior_managers'
  when 'diamond' then 'senior_managers'
  else 'newbie'
end;

alter table public.profiles
  add constraint profiles_status_check check (
    status in (
      'newbie','probie','pro','distributor','manager','senior_managers'
    )
  );
