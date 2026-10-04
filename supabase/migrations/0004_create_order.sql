-- Aether: order creation.
-- Run after 0001_schema.sql, 0002_rls.sql, 0003_grants.sql and seed.sql.
-- Safe to re-run: every statement is idempotent or uses create or replace.
--
-- Orders are written through one function and one transaction. The browser never
-- sends a price or a total: the server reads prices from products.price, so a
-- tampered cart cannot change what a customer is charged.

-- 1. Record the chosen size on each order line --------------------------------
alter table public.order_items
  add column if not exists size text;

comment on column public.order_items.size is
  'Size chosen at purchase time. Null when the product is not sized.';

-- 2. One order per idempotency key ---------------------------------------------
-- 0001_schema.sql created this as a unique constraint. This adds a unique
-- index too, so the guarantee exists whichever form is present.
create unique index if not exists orders_user_idempotency_key_uidx
  on public.orders (user_id, idempotency_key);

-- 3. create_order --------------------------------------------------------------
-- security definer so it can write orders and order items, which no client
-- policy allows. search_path is empty and every name is fully qualified.
--
-- Who may call it: only service_role (see section 4). The server action takes
-- p_user_id from the verified session, never from the browser. A service-role
-- request has no JWT, so auth.uid() is null here and is deliberately not used.
create or replace function public.create_order(
  p_user_id          uuid,
  p_items            jsonb,
  p_delivery         jsonb,
  p_idempotency_key  text,
  p_delivery_fee     integer default 0
)
returns table (
  order_id         uuid,
  order_number     bigint,
  total            integer,
  already_existed  boolean
)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_existing_id      uuid;
  v_existing_number  bigint;
  v_existing_total   integer;
  v_total            integer := 0;
  v_item             jsonb;
  v_line             record;
  v_product          record;
  v_quantity         integer;
  v_new_order_id     uuid;
  v_new_number       bigint;
  v_merged_items     jsonb;
begin
  if p_user_id is null then
    raise exception 'Missing user.'
      using errcode = '22023';
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception 'Missing idempotency key.'
      using errcode = '22023';
  end if;

  -- Serialise requests that share one idempotency key. A second, simultaneous
  -- request waits here until the first commits, then finds the order below.
  perform pg_advisory_xact_lock(
    hashtextextended(p_user_id::text || ':' || p_idempotency_key, 0)
  );

  -- Duplicate protection: a repeated submit returns the original order and
  -- changes nothing at all. No rows are written on this path.
  select o.id, o.order_number, o.total
    into v_existing_id, v_existing_number, v_existing_total
  from public.orders o
  where o.user_id = p_user_id
    and o.idempotency_key = p_idempotency_key
  limit 1;

  if found then
    return query
      select v_existing_id, v_existing_number, v_existing_total, true;
    return;
  end if;

  -- Validate the delivery payload, fee and item list before anything else.
  if p_delivery is null or jsonb_typeof(p_delivery) <> 'object' then
    raise exception 'Delivery details are required.'
      using errcode = '22023';
  end if;

  if p_delivery_fee is null or p_delivery_fee < 0 then
    raise exception 'Delivery fee must be zero or more.'
      using errcode = '22023';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Your cart could not be read. Please try again.'
      using errcode = '22023';
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty.'
      using errcode = '22023';
  end if;

  if jsonb_array_length(p_items) > 20 then
    raise exception 'Too many items in one order. Please try again.'
      using errcode = '22023';
  end if;

  -- Check the shape of every line.
  for v_item in
    select e.value from jsonb_array_elements(p_items) as e(value)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'Your cart could not be read. Please try again.'
        using errcode = '22023';
    end if;

    if (v_item ->> 'product_id') is null
       or (v_item ->> 'product_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'A cart item is not a valid product.'
        using errcode = '22023';
    end if;

    if jsonb_typeof(v_item -> 'quantity') is distinct from 'number'
       or (v_item ->> 'quantity') !~ '^[0-9]{1,2}$' then
      raise exception 'Item quantities must be between 1 and 20.'
        using errcode = '22023';
    end if;

    v_quantity := (v_item ->> 'quantity')::integer;

    if v_quantity < 1 or v_quantity > 20 then
      raise exception 'Item quantities must be between 1 and 20.'
        using errcode = '22023';
    end if;
  end loop;

  -- Merge duplicate lines for the same product and size, so one line cannot be
  -- repeated to slip past the per-line quantity limit.
  select coalesce(jsonb_agg(
           jsonb_build_object(
             'product_id', g.product_id,
             'quantity',   g.quantity,
             'size',       g.size
           )
         ), '[]'::jsonb)
    into v_merged_items
  from (
    select (e.value ->> 'product_id')::uuid                          as product_id,
           nullif(trim(coalesce(e.value ->> 'size', '')), '')        as size,
           sum((e.value ->> 'quantity')::integer)                    as quantity
    from jsonb_array_elements(p_items) as e(value)
    group by 1, 2
  ) g;

  if exists (
    select 1
    from jsonb_array_elements(v_merged_items) as e(value)
    where (e.value ->> 'quantity')::integer > 20
  ) then
    raise exception 'Item quantities must be between 1 and 20.'
      using errcode = '22023';
  end if;

  -- Lock the product rows in a stable id order, so two orders touching the same
  -- products can never deadlock each other.
  perform p.id
  from public.products p
  where p.id in (
    select (e.value ->> 'product_id')::uuid
    from jsonb_array_elements(v_merged_items) as e(value)
  )
  order by p.id
  for update;

  -- Check every product, then price from the database row.
  for v_line in
    select
      (e.value ->> 'product_id')::uuid  as product_id,
      (e.value ->> 'quantity')::integer as quantity,
      nullif(e.value ->> 'size', '')    as size
    from jsonb_array_elements(v_merged_items) as e(value)
  loop
    select pr.id, pr.name, pr.price, pr.stock, pr.sizes
      into v_product
    from public.products pr
    where pr.id = v_line.product_id;

    if not found then
      raise exception 'A piece in your cart is no longer available.'
        using errcode = 'P0002';
    end if;

    -- Sizes: required when the product has them, rejected when it does not.
    if v_product.sizes is not null then
      if v_line.size is null then
        raise exception 'Choose a size for %', v_product.name
          using errcode = 'P0002';
      end if;

      if not (v_line.size = any (v_product.sizes)) then
        raise exception 'Size % is not available for %', v_line.size, v_product.name
          using errcode = 'P0002';
      end if;
    elsif v_line.size is not null then
      raise exception '% does not come in sizes', v_product.name
        using errcode = 'P0002';
    end if;

    if v_product.stock < v_line.quantity then
      raise exception 'Only % left of %', v_product.stock, v_product.name
        using errcode = 'P0002';
    end if;

    -- Price always comes from the database row, never from the browser.
    v_total := v_total + (v_product.price * v_line.quantity);
  end loop;

  v_total := v_total + p_delivery_fee;

  -- Header, then lines, then stock. Any failure here rolls the whole order back.
  insert into public.orders as o (
    user_id, total, status, delivery_address, idempotency_key
  )
  values (p_user_id, v_total, 'pending', p_delivery, p_idempotency_key)
  returning o.id, o.order_number
  into v_new_order_id, v_new_number;

  for v_line in
    select
      (e.value ->> 'product_id')::uuid  as product_id,
      (e.value ->> 'quantity')::integer as quantity,
      nullif(e.value ->> 'size', '')    as size
    from jsonb_array_elements(v_merged_items) as e(value)
  loop
    insert into public.order_items (order_id, product_id, quantity, price, size)
    select v_new_order_id, v_line.product_id, v_line.quantity, pr.price, v_line.size
    from public.products pr
    where pr.id = v_line.product_id;

    update public.products pr
    set stock = pr.stock - v_line.quantity
    where pr.id = v_line.product_id;
  end loop;

  return query select v_new_order_id, v_new_number, v_total, false;
end;
$$;

-- 4. Permissions ---------------------------------------------------------------
-- create_order bypasses RLS, so it must not be callable directly by anyone.
-- Revoked from public (which covers anon and authenticated) and granted only to
-- service_role, the role the server action uses. A browser only ever holds the
-- anon key, so it can never reach this function.
revoke execute on function public.create_order(uuid, jsonb, jsonb, text, integer) from public;
revoke execute on function public.create_order(uuid, jsonb, jsonb, text, integer) from anon;
revoke execute on function public.create_order(uuid, jsonb, jsonb, text, integer) from authenticated;

grant execute on function public.create_order(uuid, jsonb, jsonb, text, integer) to service_role;

comment on function public.create_order(uuid, jsonb, jsonb, text, integer) is
  'Creates an order and its items in one transaction, pricing from products.price. Server-only: execute is granted to service_role only.';