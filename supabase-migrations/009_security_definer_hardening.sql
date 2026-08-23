-- Migration 009: Security-definer hardening
--
-- Scope:
--   1. Make the public users view obey invoker permissions/RLS.
--   2. Limit the columns that anon/authenticated can read from users.
--   3. Remove public EXECUTE from RPCs that are only used by server code or triggers.
--   4. Pin search_path for every SECURITY DEFINER helper to prevent search-path hijacking.
--
-- The is_admin() helper remains executable by anon/authenticated because it is referenced
-- by RLS policies. It returns only a boolean and is pinned to a safe search_path.

BEGIN;

-- The view exposes only non-sensitive columns. Make its permissions follow the caller.
ALTER VIEW IF EXISTS public.users_public_view SET (security_invoker = true);

-- Remove broad SELECT access only, then grant only the columns required by the public view.
-- Other DML privileges are intentionally left untouched to avoid changing application writes.
REVOKE SELECT ON TABLE public.users FROM anon, authenticated;
GRANT SELECT (user_id, name, avatar_url, is_active, created_at, role_id)
  ON TABLE public.users TO anon, authenticated;

-- Permit only active public rows through the invoker view. Existing self/admin policies remain.
DROP POLICY IF EXISTS users_public_active_read ON public.users;
CREATE POLICY users_public_active_read
  ON public.users
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- These functions are not part of the browser API. The application calls increment_coupon_usage
-- with the server-only Supabase service client; the other functions are trigger/internal helpers.
REVOKE EXECUTE ON FUNCTION public.apply_coupon_if_valid(text, numeric) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_auth_user_to_public_users() FROM PUBLIC, anon, authenticated;

-- Pin search_path for SECURITY DEFINER functions and the shared helper used by RLS.
ALTER FUNCTION public.apply_coupon_if_valid(text, numeric)
  SET search_path = public, auth, pg_temp;
ALTER FUNCTION public.increment_coupon_usage(text)
  SET search_path = public, auth, pg_temp;
ALTER FUNCTION public.handle_new_user()
  SET search_path = public, auth, pg_temp;
ALTER FUNCTION public.sync_auth_user_to_public_users()
  SET search_path = public, auth, pg_temp;
ALTER FUNCTION public.is_admin()
  SET search_path = public, auth, pg_temp;
ALTER FUNCTION public.current_user_id()
  SET search_path = public, auth, pg_temp;

COMMIT;
