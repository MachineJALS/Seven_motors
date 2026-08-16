-- Run this once in the Supabase SQL Editor, after 0001_create_vehicles.sql.
-- Implements .claude/specs/lead-persistence/spec.md.

create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  source      text not null check (source in ('whatsapp-header', 'whatsapp-vehicle-inquiry')),
  vehicle_id  text references vehicles(id) on delete set null,
  message     text not null,
  created_at  timestamptz not null default now()
);

alter table leads enable row level security;

-- Public visitors can create a lead (this is what happens when someone
-- clicks a WhatsApp button) but can never read, update, or delete leads.
create policy "anyone can record a lead"
  on leads for insert
  to anon, authenticated
  with check (true);

-- Only the signed-in admin can see the leads list.
create policy "authenticated users can read leads"
  on leads for select
  to authenticated
  using (true);

create policy "authenticated users can delete leads"
  on leads for delete
  to authenticated
  using (true);
