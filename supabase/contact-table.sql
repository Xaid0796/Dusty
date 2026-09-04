-- Create the dedicated 'contact' table for the DocXume contact form.
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query → paste → Run).

create table if not exists public.contact (
  id          bigint generated always as identity primary key,
  name        text not null default 'Anonymous',
  email       text not null default '',
  category    text not null default 'support',  -- support | feedback | report
  message     text not null,
  status      text not null default 'new',       -- new | read | replied
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security (static export uses the anon key, so we must
-- explicitly allow anonymous inserts; reads are restricted to the owner).
alter table public.contact enable row level security;

-- Allow anyone (anon) to submit a contact message.
drop policy if exists "Allow anon insert on contact" on public.contact;
create policy "Allow anon insert on contact"
  on public.contact
  for insert
  to anon
  with check (true);

-- (Optional) Prevent anon from reading/deleting contact data.
-- By default with RLS enabled and no select policy, anon cannot read.
-- If you manage messages via the Supabase dashboard (service role), no
-- extra policy is needed for your own access.
