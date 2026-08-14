-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query)
-- for project https://oluqpjqagunyqwevldfg.supabase.co.
-- Implements .claude/specs/supabase-inventory-backend/spec.md.

create table if not exists vehicles (
  id           text primary key,
  brand        text not null,
  model        text not null,
  year         int not null,
  price_crc    numeric not null,
  mileage_km   int not null,
  fuel_type    text not null check (fuel_type in ('gasoline', 'diesel', 'hybrid', 'electric')),
  transmission text not null check (transmission in ('automatic', 'manual')),
  color        text not null,
  description  text not null,
  photos       text[] not null,
  sold         boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table vehicles enable row level security;

-- Public catalog: anyone (including anonymous visitors) can read.
create policy "vehicles are publicly readable"
  on vehicles for select
  to anon, authenticated
  using (true);

-- Admin panel: only a signed-in user can write. There is one admin account,
-- created directly in Authentication -> Users, not through the app.
create policy "authenticated users can insert vehicles"
  on vehicles for insert
  to authenticated
  with check (true);

create policy "authenticated users can update vehicles"
  on vehicles for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can delete vehicles"
  on vehicles for delete
  to authenticated
  using (true);

-- Seed data: the 4 vehicles migrated from the old static repository, with
-- the price bug corrected (see docs/audit-report.md Critical Finding #2 and
-- the supabase-inventory-backend spec's "Data & currency correction"
-- section). All prices are CRC (colones); the Elantra had no real listed
-- price and uses the dealer-supplied estimate (12,500 USD x 449.70 CRC/USD).
insert into vehicles (id, brand, model, year, price_crc, mileage_km, fuel_type, transmission, color, description, photos, sold)
values
  (
    'hyundai-elantra-2017', 'Hyundai', 'Elantra', 2017, 5621250, 75000,
    'gasoline', 'automatic', 'Gris',
    'Hyundai Elantra 2017, cómodo y eficiente, ideal para ciudad y carretera. Mantenimientos al día.',
    array['https://placehold.co/800x600/1F4D3D/F5F6F3?text=Hyundai+Elantra+2017'],
    false
  ),
  (
    'toyota-yaris-2008', 'Toyota', 'Yaris', 2008, 3300000, 150000,
    'gasoline', 'automatic', 'Negro',
    'Toyota Yaris 2008, vehículo económico y confiable, ideal para uso urbano. Mantenimiento regular. A/C Full. Garantia por escrito en caja y motor.',
    array['https://placehold.co/800x600/1F4D3D/F5F6F3?text=Toyota+Yaris+2008'],
    false
  ),
  (
    'Kia-Rio-Hatchback-2008', 'Kia', 'Rio Hatchback', 2008, 2750000, 150000,
    'gasoline', 'automatic', 'Celeste',
    'Kia Rio Hatchback 2008, vehículo económico y confiable, ideal para uso urbano. Mantenimiento regular. A/C Full. Garantia por escrito en caja y motor.',
    array['https://placehold.co/800x600/1F4D3D/F5F6F3?text=Kia+Rio+Hatchback+2008'],
    false
  ),
  (
    'Hyundai-Accent-Hatchback-2012', 'Hyundai', 'Accent Hatchback', 2012, 3750000, 120000,
    'gasoline', 'automatic', 'Blanco',
    'Hyundai Accent Hatchback 2012, vehículo económico y confiable, ideal para uso urbano. Mantenimiento regular. A/C Full. Garantia por escrito en caja y motor.',
    array['https://placehold.co/800x600/1F4D3D/F5F6F3?text=Hyundai+Accent+Hatchback+2012'],
    false
  )
on conflict (id) do nothing;
