-- Aether: RLS proof script (read-only, optional).
-- Run this by hand after seed.sql to prove that one customer cannot read
-- another customer's orders. It changes no data: everything runs in a
-- transaction that is rolled back.
--
-- Before running, you need two real signed-up accounts (sign in with Google on
-- the site), because orders.user_id references auth.users(id). Note both UUIDs:
--   Dashboard > Authentication > Users > copy the id for each user.
--
-- Then: place one order as each user (Stage 7 does this), and run the checks
-- below. The queries print a note next to each expected result.

-- CHECK 1: anonymous callers see no orders at all -------------------------
-- set role anon;
-- select count(*) as anon_orders from public.orders;   -- expect 0
-- set role authenticated;

-- CHECK 2: an authenticated user sees only their own orders ---------------
begin;

  -- Impersonate user A for the duration of this transaction.
  set local role authenticated;
  set local "request.jwt.claims" = '{"sub":"USER_A_UUID","role":"authenticated"}';

  select count(*) as user_a_orders from public.orders;
  -- expect: exactly the number of orders user A placed.

  -- The critical check. This query tries to read user B's orders by guessing
  -- their id. With RLS on, the row filter hides them, so this returns 0 even
  -- though the order really exists in the table.
  select count(*) as leaked_orders
  from public.orders
  where user_id = 'USER_B_UUID';   -- expect: 0, not 1

  -- Same test through the relationship: user A reading order_items. The exists
  -- subquery in the policy means items of user B's order are invisible too.
  select count(*) as leaked_order_items
  from public.order_items
  where order_id = 'USER_B_ORDER_ID';   -- expect: 0

  -- And user A cannot write an order, because there is no insert policy at all.
  -- Uncomment to watch it fail with "new row violates row-level security policy":
  -- insert into public.orders (user_id, total, delivery_address)
  -- values ('USER_A_UUID', 100, '{}'::jsonb);

rollback;

-- CHECK 3: anonymous callers can still read the catalogue -------------------
-- Public products and categories must stay readable while orders stay private.
begin;
  set local role anon;
  select count(*) as anon_products from public.products;   -- expect: 14
rollback;
