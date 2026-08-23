-- Performance hardening: foreign-key indexes recommended by Supabase Performance Advisor.
-- Safe to re-run: each index is created only when its table and column exist.
-- The guards also keep this migration compatible with deployments that do not
-- include optional legacy tables such as analytics or refunds.

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
