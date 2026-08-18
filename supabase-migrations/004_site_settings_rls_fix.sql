-- ══════════════════════════════════════════════════════════════
-- Migration 004: Fix site_settings RLS policy (security)
--
-- Issue: site_settings_public_read allowed anyone with the anon key
--        to read ALL settings, including telegram_bot_token (type='secret').
--        This exposed the Telegram bot token publicly.
--
-- Fix: Restrict public SELECT to non-secret settings only.
--      Add admin-only policy for secret settings.
--
-- Idempotent: Uses OR REPLACE and DROP IF EXISTS.
-- ══════════════════════════════════════════════════════════════

BEGIN;

-- Drop the existing permissive policy
DROP POLICY IF EXISTS site_settings_public_read ON public.site_settings;

-- Recreate: public can read ONLY non-secret settings
CREATE POLICY site_settings_public_read
  ON public.site_settings
  FOR SELECT
  USING (type <> 'secret');

-- Add: only admins can read secret settings
DROP POLICY IF EXISTS site_settings_secret_admin_read ON public.site_settings;
CREATE POLICY site_settings_secret_admin_read
  ON public.site_settings
  FOR SELECT
  USING (type = 'secret' AND public.is_admin());

-- Verify admin-write policy exists (idempotent)
DROP POLICY IF EXISTS site_settings_admin_write ON public.site_settings;
CREATE POLICY site_settings_admin_write
  ON public.site_settings
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Backfill: mark telegram_bot_token as secret if it isn't already
UPDATE public.site_settings
SET type = 'secret'
WHERE key = 'telegram_bot_token' AND type <> 'secret';

COMMIT;

-- ─── Verification queries (run manually to confirm) ──────────
-- Public (anon key) should NOT see telegram_bot_token:
--   SELECT key, type FROM site_settings;
-- Admin should see ALL rows including telegram_bot_token.
