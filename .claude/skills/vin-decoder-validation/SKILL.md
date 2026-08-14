---
name: vin-decoder-validation
description: Use when adding VIN (Vehicle Identification Number) capture, validation, or decoding to any part of the app — e.g. an admin "add vehicle" form, a lookup feature, or a data-import script. Covers VIN format validation (17-char check-digit rule) and how to decode manufacturer/year/plant info without a paid API. Not needed for anything unrelated to VIN handling.
---

# VIN decoding & validation

No vehicle in the current inventory has a VIN on file (`Vehicle` in
`src/modules/inventory/domain/vehicle.ts` has no `vin` field yet — it's an
additive change when this is needed). This skill defines how to add and
validate one correctly.

## Format validation (do this before any decoding)

A VIN is exactly 17 characters, uppercase alphanumeric, excluding `I`, `O`,
`Q` (too easily confused with `1`, `0`). Validate in this order:

1. Length === 17.
2. Matches `^[A-HJ-NPR-Z0-9]{17}$` (excludes I/O/Q).
3. Check-digit validation (position 9, North American VINs): each character
   maps to a value via the standard VIN transliteration table, multiplied by
   a fixed per-position weight, summed, mod 11 — the result (or `X` for 10)
   must equal position 9. Reject the VIN if it doesn't and surface a clear
   error rather than silently accepting bad data — this is the #1 place
   admin data-entry mistakes happen.

Only VINs that pass all three go on to decoding. Never treat a
format-invalid VIN as "unknown" and continue — reject it at the input
boundary (the form / import step), matching this project's rule of only
validating at system boundaries (see root `CLAUDE.md`).

## Decoding without a paid API

The first 3 characters (WMI — World Manufacturer Identifier) identify the
manufacturer/country; position 10 encodes model year via a fixed
letter/number table; position 11 is the plant code (manufacturer-specific,
often not worth decoding for a small dealership's needs).

For an MVP, prefer the free NHTSA vPIC API
(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/{vin}?format=json`) over
hand-rolling the WMI table — it's free, no key required, and covers far more
manufacturers correctly than a hand-maintained table would. Only fall back to
local WMI/year decoding if the feature must work fully offline.

## Where this plugs into the codebase

- Domain: add `vin?: string` to `Vehicle` in
  `src/modules/inventory/domain/vehicle.ts` (optional — existing 4 seed
  vehicles have none).
- Application: a `validateVin(vin: string): boolean` /
  `decodeVin(vin: string): Promise<VinInfo>` pair belongs in
  `src/modules/inventory/application/`, not in a component — components call
  the use-case, they don't embed the check-digit math.
- This is squarely `inventory-agent` territory (see
  `.claude/agents/inventory-agent.md`) — route VIN-related work there.

## Common mistakes to avoid

- Treating a format-valid-but-check-digit-invalid VIN as "probably fine" —
  it's usually a typo; reject and ask the user to re-enter.
- Decoding on every keystroke — debounce or decode on blur/submit only, the
  NHTSA API is free but not meant for per-keystroke calls.
- Assuming the decoded manufacturer name matches the dealer's free-text
  `brand` field exactly (e.g. "HYUNDAI MOTOR COMPANY" vs `"Hyundai"`) — treat
  decoded output as a suggestion to confirm, not an auto-overwrite.
