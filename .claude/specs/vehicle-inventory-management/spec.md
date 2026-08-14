# Spec: Vehicle Inventory Management

## Status

`approved` — describes the current MVP implementation (catalog + detail
view over a static repository) plus the additive extension point for the
Phase 2 Supabase-backed repository.

## Objective

Buyers need to browse Seven Motor's available vehicles, narrow the list down
to what they can afford and want, and see enough detail on a specific vehicle
to decide whether to reach out. Without this, the dealer's only inventory
channel is word-of-mouth or manual WhatsApp back-and-forth for every car —
this feature is the entire value proposition of the site. It must work
correctly in both Spanish and English (see `docs/architecture.md` §i18n).

## Module & layer mapping

`src/modules/inventory`, all four layers:
- `domain/vehicle.ts` — `Vehicle`, `FuelType`, `Transmission`
- `application/filter-vehicles.ts` — `filterVehicles`, `listBrands`, `listFuelTypes`
- `infrastructure/static-vehicle-repository.ts` — today's data source
- `presentation/{components,pages}` — `CatalogPage`, `VehicleDetailPage`,
  `VehicleCard`, `FilterBar`, `PriceTag`

Consumed by `src/modules/leads` (the WhatsApp inquiry message needs the
vehicle's brand/model/year/price) — leads depends on inventory's domain type,
never the reverse.

## Functional requirements

1. The catalog page MUST list every vehicle in the repository, showing at
   minimum brand, model, year, price, mileage, transmission, and fuel type.
2. The catalog MUST support filtering by brand, maximum price, minimum year,
   and fuel type, combinable (AND semantics), client-side, with an instant
   (no page reload) result count.
3. A "clear filters" control MUST appear only when at least one filter is
   active, and MUST reset all filters at once.
4. Each vehicle MUST be reachable at a stable per-vehicle URL
   (`/vehiculo/:id`) showing full detail: all photos (with a thumbnail
   switcher when there's more than one), full spec table, and description.
5. A vehicle marked `sold` MUST show a "sold" indicator on its card and its
   detail page, and MUST NOT show an active WhatsApp inquiry button in that
   state.
6. The detail page for a nonexistent `id` MUST show a "vehicle not found"
   message with a way back to the catalog, not a blank page or crash.
7. Every vehicle detail page MUST expose a one-click WhatsApp inquiry
   pre-filled with a message identifying the specific vehicle (brand, model,
   year, price) in the visitor's currently selected language.

## Non-functional requirements

- **i18n**: every string in requirements 1–7 (labels, empty states, buttons)
  must render in both `es` and `en` via `src/shared/i18n`; enum values
  (`fuelType`, `transmission`) are translated, not stored translated.
- **Data integrity**: `price` is documented as USD; see the known data-quality
  issue in `docs/audit-report.md` (some seed prices carry colones-scale
  values) — any future data-entry path (Phase 2 admin) MUST validate price is
  plausible in USD before saving.
- **Performance**: filtering must stay client-side and instant for inventory
  sizes typical of a single dealership (tens to low hundreds of vehicles) —
  no pagination or server-side filtering required at this scale.

## Out of scope

- Payments, financing, credit scoring — project-wide exclusion.
- Persisted lead records (the inquiry is a WhatsApp deep link only; see
  `src/modules/leads`).
- Admin editing UI (`src/modules/admin` — Phase 2).
- Structured quotes beyond the WhatsApp inquiry message (`src/modules/quotes`
  — Phase 2, see the `vehicle-quote-generator` skill for the anticipated
  shape).
- VIN capture/decoding on the current 4 seed vehicles (none have a VIN on
  file today); see the `vin-decoder-validation` skill for when VINs are added.

## Use cases

### UC-1: Browse and filter the catalog
- **Actor**: prospective buyer
- **Trigger**: visits `/`
- **Steps**: page loads full inventory → buyer sets one or more filters →
  list updates to only matching vehicles → result count updates
- **Success outcome**: buyer finds a shortlist of relevant vehicles
- **Edge cases**: no vehicles match (show the empty-state message, not a
  blank grid); all filters cleared (show the full inventory again)

### UC-2: View a vehicle's detail and inquire
- **Actor**: prospective buyer
- **Trigger**: clicks a vehicle card, or opens a shared `/vehiculo/:id` link
- **Steps**: detail page loads → buyer reviews photos/spec/description →
  clicks the WhatsApp button
- **Success outcome**: WhatsApp opens with a message identifying the exact
  vehicle, in the buyer's selected language
- **Edge cases**: `id` doesn't match any vehicle (not-found state); vehicle
  is `sold` (button replaced with a disabled "sold" indicator, no WhatsApp
  link)

## Data & API contracts

```ts
// src/modules/inventory/domain/vehicle.ts
type FuelType = "gasoline" | "diesel" | "hybrid" | "electric";
type Transmission = "automatic" | "manual";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number; // CRC (Costa Rican colones) — was USD in the original MVP, see docs/audit-report.md Finding #2
  mileage: number; // km
  fuelType: FuelType;
  transmission: Transmission;
  color: string;
  description: string; // Spanish only for MVP, see docs/architecture.md
  photos: string[];
  sold?: boolean;
}
```

**Update**: `infrastructure/supabase-vehicle-repository.ts` now backs this
with a real Supabase table, exposing `getVehicles(): Promise<Vehicle[]>` /
`getVehicleById(id): Promise<Vehicle | null>` — see
`.claude/specs/supabase-inventory-backend/spec.md` for the full contract.
`domain/` and `application/` were unaffected; `presentation/` gained
loading/error states for the now-async reads.

## Dependencies

- **Skills**: `inventory-search-filtering` (the filter pattern used here is
  the reference implementation the skill documents); `vin-decoder-validation`
  (once VINs are added to the data model); `vehicle-quote-generator` (leads
  module reuses vehicle data this spec owns).
- **Agents**: `inventory-agent` (primary owner of this module); `sales-lead-agent`
  (consumes this module's `Vehicle` type); `customer-service-agent` (reviews
  the bilingual copy in `presentation/`).
- **Modules**: `leads` depends on this spec's `Vehicle` type.

## Acceptance criteria

- [x] Catalog lists all vehicles from the repository with brand/model/year/price/mileage/transmission/fuel type.
- [x] Filters (brand, max price, year-from, fuel type) combine correctly and update the result count.
- [x] "Clear filters" appears only when a filter is active.
- [x] Detail page renders full spec + photo switcher for multi-photo vehicles.
- [x] Not-found state renders for an unknown `id`.
- [x] Sold vehicles show a sold indicator and no active WhatsApp button.
- [x] WhatsApp inquiry message includes brand/model/year/price in the active language.
- [x] All strings covered by `es`/`en` translations; enum values render via `enums.*` keys, not raw data.
- [x] Phase 2: repository swapped to Supabase without changing `domain/` or `application/` (`presentation/` gained loading/error states, as anticipated).

## Test plan

No automated test runner is configured yet (see `docs/audit-report.md`).
Manual verification for this spec:
1. `npm run build` and `npm run lint` — must both pass.
2. `npm run dev`, then in the browser: apply each filter individually and in
   combination; confirm the count and grid match; clear filters.
3. Open a vehicle detail page, switch language with the header toggle,
   confirm every label (including the WhatsApp message text you'd send)
   updates; click through the photo thumbnails if the vehicle has more than
   one photo.
4. Visit `/vehiculo/does-not-exist` and confirm the not-found state.

## Implementation notes

Implemented as part of the Phase 3 architecture restructuring
(`docs/migration-plan.md`). One seed vehicle entry in the pre-restructure data
file was a malformed empty object that failed `tsc` — it was dropped rather
than migrated; see `docs/audit-report.md` Critical Finding #1.
