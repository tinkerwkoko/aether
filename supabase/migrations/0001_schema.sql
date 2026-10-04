-- Aether: core schema.
-- Run order: 0001_schema.sql, then 0002_rls.sql, then seed.sql.
-- Safe to read top to bottom. Money is stored as whole naira integers.

-- gen_random_uuid() lives in pgcrypto on older Supabase projects.
create extension if not exists pgcrypto;

-- Categories ---------------------------------------------------------------
-- The four Aether categories, in display order.
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  sort_order  integer not null default 0
);

comment on table public.categories is 'Product categories. Public read-only.';

-- Products -----------------------------------------------------------------
-- Optional columns exist only where the catalogue actually uses them:
-- short_description, sizes, details, material and dimensions are all nullable.
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text not null unique,
  description       text not null,
  short_description text,
  price             integer not null check (price >= 0),
  category_id       uuid not null references public.categories (id) on delete restrict,
  image_url         text,
  stock             integer not null default 0 check (stock >= 0),
  is_featured       boolean not null default false,
  sizes             text[],
  details           text[],
  material          text,
  dimensions        text,
  created_at        timestamptz not null default now()
);

comment on column public.products.price is 'Whole naira. Never a decimal amount.';
comment on column public.products.image_url is 'Path under public/images, or null to use the labelled placeholder.';
comment on column public.products.sizes is 'Clothing only: S, M, L, XL.';

-- Profiles -----------------------------------------------------------------
-- One row per auth user, created automatically by the trigger at the bottom.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  email      text,
  created_at timestamptz not null default now()
);

-- Orders -------------------------------------------------------------------
-- Clients never insert or update orders. Checkout writes them server-side in
-- Stage 7 through one atomic RPC. order_number is what customers see as AE-000123.
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     bigint generated always as identity unique,
  user_id          uuid not null references auth.users (id) on delete restrict,
  total            integer not null check (total >= 0),
  status           text not null default 'pending'
                   check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  delivery_address jsonb not null,
  idempotency_key  text,
  created_at       timestamptz not null default now(),
  -- Guards against a double-clicked Place Order creating two orders.
  constraint orders_user_idempotency_key_key unique (user_id, idempotency_key)
);

comment on column public.orders.total is 'Whole naira, recalculated server-side. Never trusted from the browser.';

-- Order items --------------------------------------------------------------
-- price is a snapshot of the price at purchase time, so an order total never
-- shifts when the catalogue changes.
create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity   integer not null check (quantity > 0),
  price      integer not null check (price >= 0)
);

comment on column public.order_items.price is 'Purchase-time price snapshot, whole naira.';

-- Saved items --------------------------------------------------------------
-- Powers the Save action on product cards. Unique per user and product.
create table if not exists public.saved_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint saved_items_user_id_product_id_key unique (user_id, product_id)
);

-- Indexes ------------------------------------------------------------------
-- Every foreign key is indexed, plus the sort column the catalogue reads by.
create index if not exists products_category_id_idx    on public.products (category_id);
create index if not exists products_created_at_idx    on public.products (created_at desc);
create index if not exists products_is_featured_idx   on public.products (is_featured);
create index if not exists orders_user_id_idx          on public.orders (user_id);
create index if not exists order_items_order_id_idx    on public.order_items (order_id);
create index if not exists order_items_product_id_idx  on public.order_items (product_id);
create index if not exists saved_items_user_id_idx     on public.saved_items (user_id);
create index if not exists saved_items_product_id_idx  on public.saved_items (product_id);

-- Profile creation trigger -------------------------------------------------
-- security definer with an empty search_path: the function runs as its owner and
-- resolves nothing implicitly, so it cannot be hijacked via the search path.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

