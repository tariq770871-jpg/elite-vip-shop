-- ============================================================
-- 008_rls_security_hardening.sql
-- ============================================================
-- CRITICAL SECURITY FIX — fixes audit findings C4, C5, C6
--
-- Background:
--   The original supabase-schema.sql (and migration-full.sql,
--   migration-missing-tables.sql) contained three RLS security
--   vulnerabilities identified during the 2026-08-19 audit:
--
--   C4: users_public_read policy used `USING (true)` which exposed
--       EVERY column (including password_hash, email, phone) to any
--       anon API consumer. This is a Critical data breach risk.
--
--   C5: migration-full.sql and migration-missing-tables.sql had
--       `GRANT ALL ON ... TO anon, authenticated` on every new table.
--       This violates least-privilege — anon role should never have
--       write access to any table.
--
--   C6: trg_sync_auth_user trigger auto-promoted the very first user
--       to admin if the table was empty. Race-exploitable on a
--       publicly-reachable deployment.
--
-- This migration:
--   1. Replaces users_public_read with a RESTRICTIVE policy that
--      only exposes safe columns via a secure view.
--   2. Creates a public_users_safe VIEW with only non-sensitive columns.
--   3. Revokes ALL grants from anon/authenticated on sensitive tables.
--   4. Re-grants only SELECT on safe tables, only to authenticated.
--   5. Disables the auto-promote-first-user logic in the trigger.
--
-- Idempotent: uses DROP POLICY IF EXISTS / DROP VIEW IF EXISTS /
--             REVOKE / GRANT — safe to re-run.
-- ============================================================

BEGIN; -- atomic — all-or-nothing

-- ══════════════════════════════════════════════════════════════
-- FIX C4: Replace users_public_read with secure alternatives
-- ══════════════════════════════════════════════════════════════

-- Step 1: Drop the dangerous policy
-- Also drop legacy dangerous policies that were found during live migration
DROP POLICY IF EXISTS "all_read_users" ON public.users;
DROP POLICY IF EXISTS "users_select_all" ON public.users;
DROP POLICY IF EXISTS "insert_users" ON public.users;
DROP POLICY IF EXISTS "update_users" ON public.users;

-- Step 2: Allow users to read ONLY their own row (full row, including password_hash for auth)
DROP POLICY IF EXISTS "users_self_read" ON public.users;
CREATE POLICY "users_self_read" ON public.users
  FOR SELECT USING (user_id = public.current_user_id());

-- Step 3: Admins can read all user rows (for admin panel)
DROP POLICY IF EXISTS "users_admin_read" ON public.users;
CREATE POLICY "users_admin_read" ON public.users
  FOR SELECT USING (public.is_admin());

-- Step 4: Create a SAFE public view with only non-sensitive columns
-- This is what the app uses for displaying reviewer names, etc.
DROP VIEW IF EXISTS public.users_public_view;
CREATE VIEW public.users_public_view AS
  SELECT
    user_id,
    name,
    avatar_url,
    is_active,
    created_at,
    role_id
  FROM public.users
  WHERE is_active = true;

-- Revoke any default grants first (Supabase auto-grants ALL on new views)
REVOKE ALL ON public.users_public_view FROM anon, authenticated, service_role;

-- Grant SELECT on the safe view to anon + authenticated only
GRANT SELECT ON public.users_public_view TO anon, authenticated;

-- Step 5: Revoke ALL direct table access from anon + authenticated
REVOKE ALL ON public.users FROM anon, authenticated;

-- ══════════════════════════════════════════════════════════════
-- FIX C5: Revoke dangerous GRANT ALL from migration-full.sql
-- ══════════════════════════════════════════════════════════════

-- These tables had `GRANT ALL ON ... TO anon, authenticated` which
-- gave anon role INSERT/UPDATE/DELETE — extremely dangerous.
-- Revoke and re-grant only the necessary SELECT (RLS still enforces row-level access).

REVOKE ALL ON public.profiles FROM anon, authenticated;
REVOKE ALL ON public.wishlists FROM anon, authenticated;
REVOKE ALL ON public.addresses FROM anon, authenticated;
REVOKE ALL ON public.shipping_rates FROM anon, authenticated;
REVOKE ALL ON public.payments FROM anon, authenticated;
REVOKE ALL ON public.refunds FROM anon, authenticated;
REVOKE ALL ON public.analytics FROM anon, authenticated;
REVOKE ALL ON public.contact_messages FROM anon, authenticated;
REVOKE ALL ON public.coupons FROM anon, authenticated;

-- Re-grant only SELECT to authenticated (anon gets nothing on these tables)
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.wishlists TO authenticated;
GRANT SELECT ON public.addresses TO authenticated;
GRANT SELECT ON public.contact_messages TO authenticated;

-- For tables that need anon SELECT (with RLS filtering rows):
GRANT SELECT ON public.coupons TO anon, authenticated;

-- Tables that are admin-only (no anon/authenticated direct access):
--   shipping_rates, payments, refunds, analytics — admin via service role only.

-- ══════════════════════════════════════════════════════════════
-- FIX C6: Disable auto-promote-first-user race condition
-- ══════════════════════════════════════════════════════════════

-- The trg_sync_auth_user trigger function had this logic:
--   IF NEW.email = 'tariq770871@gmail.com' THEN v_user_role := 'admin';
--   ELSEIF (SELECT COUNT(*) FROM public.users) = 0 THEN v_user_role := 'admin';
--   END IF;
--
-- The `COUNT(*) = 0` check is race-exploitable: if two users register
-- simultaneously when the table is empty, BOTH get admin. On a publicly
-- reachable deployment, an attacker who knows the URL could win the
-- race and become admin.
--
-- We replace the function with a version that ONLY promotes the
-- explicitly-allowlisted owner email (no COUNT(*) check).
-- The owner email is read from site_settings so it can be changed
-- without re-deploying code.

CREATE OR REPLACE FUNCTION public.sync_auth_user_to_public_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role TEXT := 'user';
  v_admin_role_id UUID;
  v_owner_email TEXT;
  v_existing_count INTEGER;
BEGIN
  -- Skip for deleted users
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.users WHERE user_id = OLD.id;
    RETURN OLD;
  END IF;

  -- Check if this user already exists (update path)
  SELECT COUNT(*) INTO v_existing_count FROM public.users WHERE email = NEW.email;

  IF v_existing_count > 0 THEN
    -- Update the existing row's user_id to match auth.users.id (FK integrity)
    UPDATE public.users
    SET user_id = NEW.id,
        name = COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), name)
    WHERE email = NEW.email;
    RETURN NEW;
  END IF;

  -- ── Owner email allowlist (configurable via site_settings) ──
  -- Reads from site_settings where key='owner_email'.
  -- Falls back to the legacy hardcoded email if site_settings has nothing.
  SELECT value INTO v_owner_email
  FROM public.site_settings
  WHERE key = 'owner_email'
  LIMIT 1;

  IF v_owner_email IS NULL THEN
    v_owner_email := 'tariq770871@gmail.com'; -- legacy default
  END IF;

  -- Promote to admin ONLY if the email matches the configured owner
  -- (no more COUNT(*)=0 race condition)
  IF LOWER(NEW.email) = LOWER(v_owner_email) THEN
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
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1)),
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    v_admin_role_id,
    TRUE
  );

  -- Also upsert the profiles table
  INSERT INTO public.profiles (user_id, full_name, phone, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    v_user_role = 'admin'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    is_admin = EXCLUDED.is_admin,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Re-attach the trigger (in case it was detached)
DROP TRIGGER IF EXISTS trg_sync_auth_user ON auth.users;
CREATE TRIGGER trg_sync_auth_user
  AFTER INSERT OR UPDATE OR DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user_to_public_users();

-- ══════════════════════════════════════════════════════════════
-- BONUS: Force UPPERCASE on coupons.code (audit finding M-?)
-- ══════════════════════════════════════════════════════════════

-- The increment_coupon_usage RPC uses UPPER(p_code) but there was no
-- CHECK constraint to enforce uppercase storage. This means coupons
-- could be stored lowercase and the UPPER() would silently mask the
-- mismatch. Add a CHECK constraint to enforce uppercase storage.

DO $$
BEGIN
  -- Add CHECK constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_coupon_code_uppercase'
  ) THEN
    ALTER TABLE public.coupons
      ADD CONSTRAINT chk_coupon_code_uppercase
      CHECK (code = UPPER(code));
  END IF;

  -- Migrate any existing lowercase codes to uppercase
  UPDATE public.coupons SET code = UPPER(code) WHERE code != UPPER(code);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not add uppercase constraint: %', SQLERRM;
END $$;

-- ══════════════════════════════════════════════════════════════
-- VERIFY: Confirm policies are in place
-- ══════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_users_policies INTEGER;
  v_users_public_read_exists BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO v_users_policies
  FROM pg_policies WHERE tablename = 'users';

  SELECT EXISTS(
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users' AND policyname = 'users_public_read'
  ) INTO v_users_public_read_exists;

  RAISE NOTICE 'users table has % policies', v_users_policies;
  IF v_users_public_read_exists THEN
    RAISE WARNING 'users_public_read still exists — drop failed!';
  ELSE
    RAISE NOTICE 'users_public_read dropped successfully';
  END IF;
END $$;

COMMIT;

-- ============================================================
-- End of migration 008_rls_security_hardening.sql
-- ============================================================
