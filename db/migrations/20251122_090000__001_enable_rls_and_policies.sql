-- 20251116_160001__enable_rls_and_policies.sql
-- Enable RLS on tables

ALTER TABLE IF EXISTS public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;

-- Ensure items has is_active (idempotent)
ALTER TABLE IF EXISTS public.items
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Wrap policy creation in DO blocks so migrations can be re-run safely.
DO $$
BEGIN
  IF to_regclass('public.items') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_catalog.pg_policy p
      WHERE p.polname = 'public_select_items_active_or_owner'
        AND p.polrelid = 'public.items'::regclass
    ) THEN
      CREATE POLICY public_select_items_active_or_owner
      ON public.items
      FOR SELECT
      USING (
        coalesce(is_active, true) = true
        OR EXISTS (
          SELECT 1 FROM public.vendors v
          WHERE v.id = public.items.vendor_id
            AND v.owner_user_id = auth.uid()::uuid
        )
      );
    END IF;
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.items') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_catalog.pg_policy p
      WHERE p.polname = 'vendor_manage_own_items'
        AND p.polrelid = 'public.items'::regclass
    ) THEN
      CREATE POLICY vendor_manage_own_items
      ON public.items
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.vendors v
          WHERE v.id = public.items.vendor_id
            AND v.owner_user_id = auth.uid()::uuid
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.vendors v
          WHERE v.id = public.items.vendor_id
            AND v.owner_user_id = auth.uid()::uuid
        )
      );
    END IF;
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.cart') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_catalog.pg_policy p
      WHERE p.polname = 'cart_user_manage_own'
        AND p.polrelid = 'public.cart'::regclass
    ) THEN
      CREATE POLICY cart_user_manage_own
      ON public.cart
      FOR ALL
      USING (auth.uid()::uuid = user_id)
      WITH CHECK (auth.uid()::uuid = user_id);
    END IF;
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_catalog.pg_policy p
      WHERE p.polname = 'orders_user_create'
        AND p.polrelid = 'public.orders'::regclass
    ) THEN
      CREATE POLICY orders_user_create
      ON public.orders
      FOR INSERT
      WITH CHECK (auth.uid()::uuid = user_id);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_catalog.pg_policy p
      WHERE p.polname = 'orders_user_select'
        AND p.polrelid = 'public.orders'::regclass
    ) THEN
      CREATE POLICY orders_user_select
      ON public.orders
      FOR SELECT
      USING (auth.uid()::uuid = user_id);
    END IF;
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_catalog.pg_policy p
      WHERE p.polname = 'vendors_select_orders_for_their_items'
        AND p.polrelid = 'public.orders'::regclass
    ) THEN
      CREATE POLICY vendors_select_orders_for_their_items
      ON public.orders
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.order_items oi
          JOIN public.items i ON oi.item_id = i.id
          JOIN public.vendors v ON i.vendor_id = v.id
          WHERE oi.order_id = public.orders.id
            AND v.owner_user_id = auth.uid()::uuid
        )
      );
    END IF;
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.order_items') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_catalog.pg_policy p
      WHERE p.polname = 'vendors_select_order_items_for_their_items'
        AND p.polrelid = 'public.order_items'::regclass
    ) THEN
      CREATE POLICY vendors_select_order_items_for_their_items
      ON public.order_items
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.items i
          JOIN public.vendors v ON i.vendor_id = v.id
          WHERE public.order_items.item_id = i.id
            AND v.owner_user_id = auth.uid()::uuid
        )
      );
    END IF;
  END IF;
END
$$;
