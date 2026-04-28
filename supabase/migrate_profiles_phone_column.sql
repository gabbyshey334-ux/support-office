-- Run once on existing databases that still use the legacy profiles phone column name.
-- New projects: use supabase/schema.sql (column is already `phone`).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'phone_whatsapp'
  ) THEN
    ALTER TABLE public.profiles RENAME COLUMN phone_whatsapp TO phone;
  END IF;
END $$;
