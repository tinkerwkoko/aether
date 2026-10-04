-- Aether: table privileges for the Supabase API roles.
-- Run after 0001_schema.sql and 0002_rls.sql. Safe to re-run.
--
-- RLS policies decide WHICH ROWS a role can touch, but the role must first
-- hold the table privilege. Tables created in the SQL editor are not always
-- granted to the API roles, which shows up as: 42501 permission denied.
-- These grants are deliberately narrow. RLS stays on for every table.

grant usage on schema public to anon, authenticated, service_role;

-- Public catalogue: anyone can read, nobody can write from the browser.
grant select on public.categories to anon, authenticated;
grant select on public.products   to anon, authenticated;

-- Profiles: signed-in users read their own row and may change their name only.
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

-- Orders: signed-in users may only read their own. Orders are created by the
-- server (service role) in Stage 7, never by the browser.
grant select on public.orders      to authenticated;
grant select on public.order_items to authenticated;

-- Saved items: signed-in users manage their own rows (RLS limits the rows).
grant select, insert, delete on public.saved_items to authenticated;

-- Server-only role: used by trusted server code in Stage 7. Never in the browser.
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;