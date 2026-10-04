-- Aether: row level security.
-- Run after 0001_schema.sql, before seed.sql.
-- RLS stays enabled on every table and is never disabled, in any environment.

alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.profiles    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.saved_items enable row level security;

-- Categories ---------------------------------------------------------------
-- The catalogue is public to read: anyone, signed in or not, may browse.
-- There is deliberately no insert, update or delete policy, so no client can
-- change the catalogue. Only the service-role key (server-side, Stage 7) writes.
drop policy if exists "categories are publicly readable" on public.categories;
create policy "categories are publicly readable"
  on public.categories
  for select
  to anon, authenticated
  using (true);

-- Products -----------------------------------------------------------------
-- Same as categories: public select, and no client write policy at all.
drop policy if exists "products are publicly readable" on public.products;
create policy "products are publicly readable"
  on public.products
  for select
  to anon, authenticated
  using (true);

-- Profiles -----------------------------------------------------------------
-- A user may read and update only their own row. There is no insert policy:
-- the handle_new_user trigger creates the row. There is no delete policy either.
drop policy if exists "users can read their own profile" on public.profiles;
create policy "users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Orders -------------------------------------------------------------------
-- A user may read only their own orders. No insert, update or delete policy:
-- orders are created server-side in Stage 7 through an atomic RPC, so a browser
-- can never write an order or attach one to another account.
drop policy if exists "users can read their own orders" on public.orders;
create policy "users can read their own orders"
  on public.orders
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Order items --------------------------------------------------------------
-- A user may read items only when the parent order belongs to them. The exists
-- subquery checks ownership of the order, so swapping an id in the URL exposes
-- nothing. There is no write policy: order items are written server-side.
drop policy if exists "users can read their own order items" on public.order_items;
create policy "users can read their own order items"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = (select auth.uid())
    )
  );

-- Saved items --------------------------------------------------------------
-- A user may list, add and remove their own saved items, and nobody else's.
drop policy if exists "users can read their own saved items" on public.saved_items;
create policy "users can read their own saved items"
  on public.saved_items
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users can save their own items" on public.saved_items;
create policy "users can save their own items"
  on public.saved_items
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "users can remove their own saved items" on public.saved_items;
create policy "users can remove their own saved items"
  on public.saved_items
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
