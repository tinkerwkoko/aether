-- Aether: order confirmation email status.
-- Run after 0004_create_order.sql.
-- Safe to read top to bottom. Every statement is terminated.
--
-- An order is successful the moment create_order commits. These columns record
-- what happened afterwards, separately, so email can never change the order.
--
-- No client write policy is added here: only server code using the admin client
-- updates these columns. Customers already read their own orders through RLS.

alter table public.orders
  add column if not exists confirmation_email_status text
    check (confirmation_email_status in ('sent', 'failed')),
  add column if not exists confirmation_email_sent_at timestamptz,
  add column if not exists confirmation_email_attempts integer not null default 0;

comment on column public.orders.confirmation_email_status is
  'Null means no attempt has been recorded yet. Never affects the order itself.';
comment on column public.orders.confirmation_email_sent_at is
  'When Resend accepted the confirmation email.';
comment on column public.orders.confirmation_email_attempts is
  'Confirmation sends attempted, used to cap retries at 3 per order.';
