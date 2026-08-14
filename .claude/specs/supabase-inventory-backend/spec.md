# Spec: Supabase Inventory Backend

## Status

`approved` — Phase 2 item, greenlit by the project owner. Replaces
`docs/migration-plan.md` §4.1's placeholder with concrete decisions.

## Objective

The static `vehicles` array requires a code change + redeploy for every
inventory update, and the dealer currently doesn't have complete data for
every vehicle. Moving inventory to Supabase lets the dealer's data be entered
incrementally (via the `/admin` panel — see the companion
`admin-vehicle-management` spec) without touching code, and is the
prerequisite for that admin panel to have something to manage.

## Module & layer mapping

`src/modules/inventory`. Only `infrastructure/` changes — `domain/`,
`application/`, and `presentation/` keep the same `Vehicle` shape and the
same `filterVehicles`/`listBrands`/`listFuelTypes` functions, per the
layering this architecture was built for (see `docs/architecture.md`). One
presentation-layer addition: `CatalogPage`/`VehicleDetailPage` gain
loading/error states, since Supabase reads are asynchronous and the static
array was not.

A shared Supabase client is added at `src/shared/infrastructure/supabase-client.ts`
(used by both `inventory` and, later, `admin`).

## Functional requirements

1. `static-vehicle-repository.ts` is replaced by
   `supabase-vehicle-repository.ts`, exporting an async
   `getVehicles(): Promise<Vehicle[]>` (the synchronous `vehicles: Vehicle[]`
   export cannot survive an async data source — this is the one contract
   change from the original spec, called out explicitly here).
2. All 4 existing vehicles are migrated into the `vehicles` table with the
   corrected data (see "Data & currency correction" below) — not copy-pasted
   with the pre-existing price bug.
3. The catalog and detail pages show a loading state while fetching, and a
   clear error state if the fetch fails (not a blank page).
4. Public (unauthenticated) visitors can read all vehicles; only an
   authenticated user can insert/update/delete (enforced by RLS, not just
   app-level checks — see `admin-vehicle-management` spec for who that is).

## Non-functional requirements

- **i18n**: loading/error state strings go through the same `es`/`en`
  dictionaries as everything else.
- **No secrets in the client bundle**: only the Supabase URL and the public
  `anon` key are used client-side (both are safe to embed — access is
  enforced by RLS, not by keeping the key secret). The `service_role` key is
  never used in this app's code.
- **Env config**: `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in
  `.env.local` (gitignored via the existing `*.local` pattern), with
  `.env.example` committed as a template.

## Out of scope

- Vehicle photo upload to Supabase Storage — photos stay as pasted image
  URLs for now (see `admin-vehicle-management` spec).
- Multi-currency per vehicle — see "Data & currency correction" below, all
  prices normalize to CRC.
- Payments, financing, credit scoring — project-wide exclusion, unaffected
  by this spec.

## Data & currency correction

The pre-restructure data had a real currency-mixing bug (see
`docs/audit-report.md` Critical Finding #2): 3 vehicles were priced in CRC
(colones) under a field documented as USD, and the 4th (Hyundai Elantra
2017) had no listed price at all — a placeholder USD estimate (12,500) was
used instead. Confirmed with the dealer and corrected here:

| Vehicle | Old (wrong) value | Corrected `price_crc` |
|---|---|---|
| Hyundai Elantra 2017 | 12,500 (labeled USD, no real listing existed) | 5,621,250 (12,500 × ₡449.70/$1, the dealer's supplied rate) |
| Toyota Yaris 2008 | 3,300,000 (labeled USD, was already CRC) | 3,300,000 |
| Kia Rio Hatchback 2008 | 2,750,000 (labeled USD, was already CRC) | 2,750,000 |
| Hyundai Accent Hatchback 2012 | 3,750,000 (labeled USD, was already CRC) | 3,750,000 |

**Decision**: normalize everything to a single currency, CRC (colones) —
that's the currency the business actually quotes in. `Vehicle.price` is now
documented as CRC, not USD; `PriceTag` and every price-formatting call site
switch from `$` to `₡`. There is no `currency` field on `Vehicle` — this was
considered (store native currency per vehicle) and rejected in favor of
normalizing, per the dealer's explicit choice, to keep display logic simple.
If USD-quoted vehicles become common later, revisit this as its own spec
rather than reintroducing ad-hoc mixed currencies.

## Use cases

### UC-1: Visitor loads the catalog
- **Actor**: prospective buyer
- **Trigger**: visits `/`
- **Steps**: `CatalogPage` calls `getVehicles()` → shows a loading state →
  renders the grid on success, or an error message with no crash on failure
- **Success outcome**: same filtering/browsing behavior as before, sourced
  from Supabase instead of a hardcoded array
- **Edge cases**: Supabase unreachable (network/config error) → visible
  error state, not a blank page; empty table (no vehicles yet) → the
  existing "no vehicles match" empty state doubles as this case

### UC-2: Visitor opens a vehicle detail page
- Same pattern as UC-1, scoped to a single vehicle by `id`; not-found
  behavior (bad `id`, or Supabase returns nothing) is unchanged from the
  existing spec.

## Data & API contracts

```sql
-- vehicles table (see the migration script provided to the project owner
-- to run in the Supabase SQL editor for the actual DDL + RLS policies)
id            text primary key        -- matches today's slug-style Vehicle.id
brand         text not null
model         text not null
year          int not null
price_crc     numeric not null        -- CRC, no decimals in practice
mileage_km    int not null
fuel_type     text not null           -- 'gasoline' | 'diesel' | 'hybrid' | 'electric'
transmission  text not null           -- 'automatic' | 'manual'
color         text not null
description   text not null
photos        text[] not null
sold          boolean not null default false
created_at    timestamptz not null default now()
```

```ts
// src/modules/inventory/infrastructure/supabase-vehicle-repository.ts
export async function getVehicles(): Promise<Vehicle[]>
export async function getVehicleById(id: string): Promise<Vehicle | null>
```

Row → domain mapping happens inside the repository (snake_case columns →
camelCase `Vehicle` fields) — `domain/vehicle.ts` does not change shape.

## Dependencies

- **Skills**: `inventory-search-filtering` (filtering logic is unaffected,
  still operates on the resolved `Vehicle[]`).
- **Agents**: `inventory-agent` owns this spec's implementation.
- **Blocks**: `admin-vehicle-management` (the admin panel writes to the same
  table this spec creates).

## Acceptance criteria

- [ ] `vehicles` table exists in Supabase with the schema above, RLS
      enabled: public `select`, authenticated-only `insert`/`update`/`delete`.
- [ ] All 4 vehicles migrated with corrected CRC prices (table above).
- [ ] `getVehicles()`/`getVehicleById()` replace the static export; no
      component imports the old static array.
- [ ] Catalog and detail pages show loading and error states.
- [ ] Every displayed price uses `₡`, not `$`; `filters.maxPrice` label and
      the WhatsApp inquiry message template both reflect CRC.
- [ ] `npm run build` and `npm run lint` pass.
- [ ] Manual check: catalog loads real data from Supabase (not the old
      static array), filters still work, a vehicle detail page renders.

## Test plan

No automated test runner (see `docs/audit-report.md`). Manual:
1. Run the provided SQL migration in the Supabase SQL editor.
2. `npm run dev`, confirm the catalog shows the 4 migrated vehicles with
   correct CRC prices.
3. Temporarily break the env var (wrong URL) to confirm the error state
   renders instead of a blank page, then restore it.
4. `npm run build` + `npm run lint`.

## Implementation notes

_(filled in during implementation)_
