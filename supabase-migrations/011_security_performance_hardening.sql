-- Migration 011: security and performance hardening
--
-- Goals:
-- 1. Remove public EXECUTE access from the SECURITY DEFINER admin helper.
-- 2. Keep the users admin-read policy functional without calling that helper.
-- 3. Evaluate auth.uid() once per statement in RLS policies.
-- 4. Add covering indexes for foreign keys reported by Supabase advisors.

BEGIN;

-- The admin helper is used internally by policy logic only. The policy below
-- is rewritten to use the same profile check directly before EXECUTE is revoked.
DROP POLICY IF EXISTS users_admin_read ON public.users;
CREATE POLICY users_admin_read
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    (SELECT EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
        AND p.is_admin = true
    ))
  );

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;

-- RLS init-plan rewrites are intentionally handled in a later, generated
-- migration after each policy expression is reviewed individually. The
-- security change below is independent and safe to apply now.

DO $$
DECLARE
  item RECORD;
BEGIN
  FOR item IN
    SELECT * FROM (VALUES
      ('analytics', 'user_id', 'idx_analytics_user_id'),
      ('cart_items', 'product_id', 'idx_cart_items_product_id'),
      ('favorites', 'product_id', 'idx_favorites_product_id'),
      ('notifications', 'user_id', 'idx_notifications_user_id'),
      ('order_items', 'order_id', 'idx_order_items_order_id'),
      ('order_items', 'product_id', 'idx_order_items_product_id'),
      ('orders', 'user_id', 'idx_orders_user_id'),
      ('products', 'category_id', 'idx_products_category_id'),
      ('products', 'seller_id', 'idx_products_seller_id'),
      ('refunds', 'user_id', 'idx_refunds_user_id'),
      ('reviews', 'product_id', 'idx_reviews_product_id'),
      ('users', 'role_id', 'idx_users_role_id')
    ) AS indexes(table_name, column_name, index_name)
  LOOP
    IF to_regclass(format('public.%I', item.table_name)) IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = item.table_name
          AND column_name = item.column_name
      ) THEN
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON public.%I (%I)',
        item.index_name,
        item.table_name,
        item.column_name
      );
    END IF;
  END LOOP;
END
$$;

COMMIT;
