-- ══════════════════════════════════════════════════════════════
-- Migration 007: increment_coupon_usage RPC
--
-- Issue fixed (C-N1):
--   src/app/api/orders/route.ts:284 calls
--     serviceClient.rpc("increment_coupon_usage", { p_code })
--   but no migration ever defined this function. On a fresh DB the
--   RPC throws, the catch swallows it silently, and `used_count`
--   never increments → every coupon with `max_uses` is effectively
--   unlimited (DoS / revenue loss).
--
--   This migration defines the function as an ATOMIC UPDATE that:
--     • Only increments when `max_uses` is NULL or `used_count < max_uses`
--     • Only matches ACTIVE coupons whose validity window covers NOW()
--     • Returns (success BOOLEAN, new_count INTEGER) so callers can
--       distinguish "limit reached" from "code not found".
--
--   Idempotent: CREATE OR REPLACE FUNCTION.
--   Depends on: public.coupons table (migration 001).
-- ══════════════════════════════════════════════════════════════

BEGIN;

-- Drop first to be safe (CREATE OR REPLACE doesn't change return type reliably)
DROP FUNCTION IF EXISTS public.increment_coupon_usage(p_code VARCHAR);

CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_code VARCHAR)
RETURNS TABLE(success BOOLEAN, new_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  -- Atomic conditional increment: only fires when limits allow.
  -- RETURNING extracts the new value in the same statement, avoiding
  -- a separate SELECT and the race between read+write.
  UPDATE public.coupons
     SET used_count = used_count + 1
   WHERE code = UPPER(p_code)
     AND is_active = TRUE
     AND (max_uses IS NULL OR used_count < max_uses)
     AND (valid_from  IS NULL OR valid_from  <= NOW())
     AND (valid_until IS NULL OR valid_until >= NOW())
  RETURNING used_count INTO v_new_count;

  -- If no row was updated, either the code doesn't exist, the coupon
  -- is inactive/expired, or the max_uses was already reached.
  IF v_new_count IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::INTEGER;
  ELSE
    RETURN QUERY SELECT TRUE, v_new_count;
  END IF;
END;
$$;

-- Revoke public execute by default; grant to authenticated role only.
-- SECURITY DEFINER runs as the function owner (postgres), so even an
-- anon user can call it safely — the WHERE clause does the gating.
REVOKE ALL ON FUNCTION public.increment_coupon_usage(VARCHAR) FROM PUBLIC, ANON;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(VARCHAR) TO AUTHENTICATED;

COMMIT;

-- ─── Verification queries (run manually) ─────────────────────
-- 1. Confirm function exists:
--    SELECT proname, prosecdef FROM pg_proc WHERE proname = 'increment_coupon_usage';
-- 2. Test with a valid coupon (replace TESTCODE):
--    SELECT * FROM public.increment_coupon_usage('TESTCODE');
-- 3. Test with exhausted coupon (should return success=false):
--    -- First exhaust it by calling max_uses+1 times, then verify false.
