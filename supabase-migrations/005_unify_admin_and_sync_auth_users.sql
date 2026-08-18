-- ══════════════════════════════════════════════════════════════
-- Migration 005: Unify is_admin() + sync auth.users → public.users + profiles table
--
-- Issues fixed (C7 + C8 + C11):
--
--  C7: API stores orders.user_id = auth.users.id, but FK constraint
--      requires it to exist in public.users.user_id (which was a random
--      UUID generated independently). Order inserts failed with FK violation.
--      FIX: Add trigger to mirror auth.users.id into public.users.user_id.
--
--  C8: SQL is_admin() checked ONLY users/roles legacy path.
--      TS verifyAdmin checks BOTH profiles.is_admin AND legacy path.
--      Admins created via profiles.is_admin failed RLS even though they
--      passed middleware.
--      FIX: Rewrite is_admin() to check both paths (profiles first, then legacy).
--           Unify current_user_id() to return auth.uid() directly.
--
--  C11: auto_promote_first_user trigger was attached to public.users,
--       but Supabase Auth inserts new users into auth.users, not public.users.
--       The trigger never fired — bootstrap admin promotion was dead code.
--       FIX: Move trigger to auth.users (AFTER INSERT) and merge with sync logic.
--
-- Idempotent: Uses CREATE OR REPLACE and DROP IF EXISTS throughout.
-- ══════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1. Create profiles table (if it doesn't exist) ──────────
-- Mirrors auth.users.id; is_admin column is the authoritative admin flag.
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(30),
  is_admin BOOLEAN DEFAULT FALSE,
  is_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. RLS for profiles ──────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_self_read ON public.profiles;
CREATE POLICY profiles_self_read
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS profiles_self_update ON public.profiles;
-- NOTE: WITH CHECK prevents a user from granting themselves is_admin = true
CREATE POLICY profiles_self_update
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND is_admin = (
    SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;
CREATE POLICY profiles_admin_all
  ON public.profiles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Trigger: keep profiles.updated_at fresh
DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── 3. Backfill profiles from existing auth.users + public.users ─
-- For each existing auth user, ensure a profiles row exists.
-- Mirror the legacy admin flag (users.role_id → roles.role_name = 'admin') into profiles.is_admin.
INSERT INTO public.profiles (user_id, full_name, phone, is_admin)
SELECT
  au.id,
  u.name,
  u.phone,
  (r.role_name IN ('admin', 'owner')) AS is_admin
FROM auth.users au
LEFT JOIN public.users u ON u.email = au.email
LEFT JOIN public.roles r ON u.role_id = r.role_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = au.id
)
ON CONFLICT (user_id) DO NOTHING;

-- ─── 4. Sync auth.users.id → public.users.user_id ────────────
-- For each auth user that has a matching public.users row by email,
-- update public.users.user_id to match auth.users.id.
-- This repairs the FK integrity for existing orders.
UPDATE public.users u
SET user_id = au.id
FROM auth.users au
WHERE u.email = au.email AND u.user_id <> au.id;

-- ─── 5. Rewrite is_admin() to match verifyAdmin TS logic ─────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_auth_uid UUID := auth.uid();
  v_legacy_role VARCHAR(50);
BEGIN
  IF v_auth_uid IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Path 1: profiles.is_admin (new schema)
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = v_auth_uid AND is_admin = TRUE
  ) THEN
    RETURN TRUE;
  END IF;

  -- Path 2: legacy users/roles join (admin OR owner)
  SELECT r.role_name INTO v_legacy_role
  FROM public.users u
  JOIN public.roles r ON u.role_id = r.role_id
  WHERE u.email = auth.jwt() ->> 'email'
  LIMIT 1;

  RETURN v_legacy_role IN ('admin', 'owner');
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─── 6. Simplify current_user_id() to return auth.uid() ──────
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─── 7. Auto-promote tariq770871@gmail.com to profiles.is_admin = true ─
UPDATE public.profiles
SET is_admin = TRUE
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'tariq770871@gmail.com'
);

COMMIT;

-- ─── 8. Create sync trigger on auth.users ────────────────────
-- (Run AFTER the transaction so the function exists when the trigger fires)
-- This trigger fires on every new Supabase Auth signup and:
--   - Inserts a row into public.users with user_id = auth.users.id (FK integrity)
--   - Auto-promotes the first user OR tariq770871@gmail.com to admin
--   - Handles the legacy trigger scenario (auto_promote_first_user)

CREATE OR REPLACE FUNCTION public.sync_auth_user_to_public_users()
RETURNS TRIGGER AS $$
DECLARE
  v_user_role VARCHAR(50) := 'user';
  v_admin_role_id UUID;
  v_existing_count INTEGER;
BEGIN
  -- Don't re-insert if a row with the same email already exists
  SELECT COUNT(*) INTO v_existing_count FROM public.users WHERE email = NEW.email;
  IF v_existing_count > 0 THEN
    -- Update the existing row's user_id to match auth.users.id (FK integrity)
    UPDATE public.users
    SET user_id = NEW.id,
        name = COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), name)
    WHERE email = NEW.email;
    RETURN NEW;
  END IF;

  -- Auto-promote the very first registered user to admin (bootstrap admin)
  -- AND auto-promote tariq770871@gmail.com explicitly (owner email)
  IF NEW.email = 'tariq770871@gmail.com' THEN
    v_user_role := 'admin';
  ELSEIF (SELECT COUNT(*) FROM public.users) = 0 THEN
    v_user_role := 'admin';
  END IF;

  SELECT role_id INTO v_admin_role_id
  FROM public.roles
  WHERE role_name = v_user_role
  LIMIT 1;

  -- Fallback to 'user' role if not found
  IF v_admin_role_id IS NULL THEN
    SELECT role_id INTO v_admin_role_id FROM public.roles WHERE role_name = 'user' LIMIT 1;
  END IF;

  INSERT INTO public.users (
    user_id,
    name,
    email,
    phone,
    role_id,
    is_active
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    v_admin_role_id,
    TRUE
  )
  ON CONFLICT (email) DO UPDATE
    SET user_id = NEW.id,
        name = EXCLUDED.name,
        phone = COALESCE(EXCLUDED.phone, public.users.phone);

  -- Also create / update profiles row to keep it in sync
  INSERT INTO public.profiles (user_id, full_name, phone, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    v_user_role = 'admin'
  )
  ON CONFLICT (user_id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old dead-code trigger on public.users
DROP TRIGGER IF EXISTS trg_auto_admin ON public.users;

-- Attach the new trigger to auth.users (Supabase Auth's internal table)
DROP TRIGGER IF EXISTS trg_sync_public_user ON auth.users;
CREATE TRIGGER trg_sync_public_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user_to_public_users();

-- ─── 9. Backward-compat shim: auto_promote_first_user() is now a no-op ─
-- Old migration files may reference it; keep the symbol alive.
CREATE OR REPLACE FUNCTION public.auto_promote_first_user()
RETURNS TRIGGER AS $$
BEGIN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Verification queries (run manually) ─────────────────────
-- 1. Confirm profiles table exists with correct columns:
--    \d public.profiles
-- 2. Confirm is_admin() works for known admin:
--    SELECT public.is_admin();  -- when logged in as tariq770871@gmail.com
-- 3. Confirm trigger is attached:
--    SELECT tgname, tgrelid::regclass, tgenabled FROM pg_trigger WHERE tgname = 'trg_sync_public_user';
-- 4. Confirm FK integrity for existing orders:
--    SELECT COUNT(*) FROM orders o LEFT JOIN public.users u ON o.user_id = u.user_id WHERE u.user_id IS NULL;
--    -- Should return 0
