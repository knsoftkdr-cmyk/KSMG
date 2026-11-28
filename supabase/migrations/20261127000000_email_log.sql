-- Log of every customer email the send-email Edge Function tried to send.
-- Rows are written only by the Edge Function (service role). Sales and
-- super_admin can read them to see what each customer was told.
-- Run this once in the Supabase SQL editor (or with `supabase db push`).

create table if not exists public.email_log (
  id          uuid primary key default gen_random_uuid(),
  enquiry_id  text not null,
  rfq_id      text,
  event       text not null,
  recipient   text not null default '',
  subject     text not null default '',
  status      text not null check (status in ('sent', 'failed', 'skipped')),
  provider_id text,
  error       text,
  sent_by     uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists email_log_enquiry_idx on public.email_log (enquiry_id, created_at desc);

alter table public.email_log enable row level security;

drop policy if exists "staff read email log" on public.email_log;
create policy "staff read email log" on public.email_log
  for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('sales', 'super_admin')
  ));

-- No insert / update / delete policies: only the service role (Edge Function) writes.
