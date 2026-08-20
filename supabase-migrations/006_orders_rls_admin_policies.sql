-- ══════════════════════════════════════════════════════════════
-- Migration 006: Unify orders RLS policies with is_admin()
--
-- Issue fixed (H15):
--   Migration 003 added orders RLS policies using auth.uid() for
--   user_id and seller_id checks, but had NO admin policy.
--   The comment "Admin can do everything (via service role key, bypasses RLS)"
--   was misleading: admins using a regular client (e.g. dashboard with
--   verifyAdmin middleware) were blocked by RLS and forced to use the
--   service role client, which bypasses all RLS — defeating the
--   principle of least privilege.
--
--   This migration:
--     1. Drops the three original policies from migration 003.
--     2. Recreates them WITH CHECK / USING clauses that include
--        public.is_admin() so admins can read/write via a regular
--        client (RLS-aware path) instead of being forced to the
--        service role.
--     3. Adds UPDATE and DELETE policies (missing in migration 003)
--        so users can cancel their own pending orders and admins
--        can manage any order.
--
--   Depends on: migration 005 (defines public.is_admin()).
--   Idempotent: uses DROP POLICY IF EXISTS / CREATE POLICY.
-- ══════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1. Drop existing orders policies from migration 003 ───────
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can delete own orders" ON public.orders;

-- ─── 2. SELECT policies (user + seller + admin) ───────────────
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = user_id OR public.is_admin()
  );

CREATE POLICY "Sellers can view their orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = seller_id OR public.is_admin()
  );

-- ─── 3. INSERT policy (user + admin) ─────────────────────────
-- WITH CHECK enforces that the inserted user_id matches the
-- authenticated user, preventing impersonation. Admins bypass.
CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR public.is_admin()
  );

-- ─── 4. UPDATE policies (user can cancel own pending + admin) ─
-- Users may update only their own orders (e.g. cancel before shipment).
-- Admins can update any order (status changes, refund notes, etc.).
CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can update all orders" ON public.orders
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── 5. DELETE policies (user can cancel own pending + admin) ─
-- Soft-delete pattern preferred (status = 'cancelled'), but
-- hard-delete allowed for admins to clean up test/spam orders.
CREATE POLICY "Users can delete own orders" ON public.orders
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete all orders" ON public.orders
  FOR DELETE USING (public.is_admin());

COMMIT;

-- ─── Verification queries (run manually) ─────────────────────
-- 1. List all orders policies:
--    SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'orders';
-- 2. Test admin SELECT (as admin user, regular client):
--    SELECT COUNT(*) FROM orders;  -- should return all orders, not just own
-- 3. Test regular user UPDATE on someone else's order (should fail):
--    UPDATE orders SET status = 'cancelled' WHERE user_id <> auth.uid() LIMIT 1;
