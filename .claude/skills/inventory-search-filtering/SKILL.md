---
name: inventory-search-filtering
description: Use when adding, changing, or extending how vehicles are searched or filtered — new filter fields, sorting, or search-box/text matching on the catalog. Documents the existing filter pattern in src/modules/inventory/application/filter-vehicles.ts so new filters stay consistent instead of reinventing the approach. Not needed for unrelated inventory work like pricing or VIN handling.
---

# Inventory search & filtering pattern

The catalog's filtering logic lives entirely in
`src/modules/inventory/application/filter-vehicles.ts` — a pure, framework-free
module. `CatalogPage` (presentation layer) only holds UI state and calls into
it. Keep that split when extending filtering: **no filtering logic in
components.**

## The existing pattern

```ts
export interface VehicleFilters {
  brand: string;
  maxPrice: string;
  yearFrom: string;
  fuelType: string;
}

export function filterVehicles(vehicles: Vehicle[], filters: VehicleFilters): Vehicle[] {
  return vehicles.filter((vehicle) => {
    if (filters.brand && vehicle.brand !== filters.brand) return false;
    // ...one early-return guard per active filter
    return true;
  });
}
```

Filter values are `string` (not `number`/`enum`) because they come straight
out of form controls — conversion happens inside `filterVehicles`, not in the
component. This avoids `NaN`/type-juggling bugs in the UI layer.

## Adding a new filter field

1. Add the field to `VehicleFilters` and to `emptyFilters`.
2. Add one `if (filters.x && ...) return false;` guard in `filterVehicles` —
   keep the AND-combination semantics (every active filter narrows the
   result; there's no OR mode today, and there's no evidence this dealership
   needs one at ~4-vehicle scale).
3. Add the corresponding control to `FilterBar` (presentation), wired through
   the existing `onChange` callback — don't add local component state that
   duplicates `VehicleFilters`.
4. Add `es`/`en` translation keys under `filters.*` in
   `src/shared/i18n/locales/{es,en}/common.json` — every filter label and
   placeholder must be translated, per this project's i18n requirement (see
   `docs/architecture.md`).
5. If the filter is over an enum (like `fuelType`), render the **translated**
   label in the `<option>` but keep the underlying value as the English enum
   code — see how `fuelType` does this via `t(\`enums.fuelType.${value}\`)`.

## Scale note

`filterVehicles` runs entirely client-side over an in-memory array — correct
for a single dealership's inventory (tens, maybe low hundreds of vehicles).
If inventory ever grows enough that this becomes a real performance concern,
that's an infrastructure-layer change (server-side/DB filtering via the
Phase 2 Supabase repository), not a reason to complicate this function today
— don't add memoization or pagination speculatively.

## Free-text search (not yet implemented)

If a text search box gets added later, keep it as an additional
`filterVehicles` guard against a lowercase-normalized concatenation of
brand+model+description — don't introduce a search library for this data
size. This is `inventory-agent` territory.
