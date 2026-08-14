---
name: vehicle-quote-generator
description: Use when building or changing anything that produces a price quote or inquiry summary for a specific vehicle — today that's the WhatsApp inquiry message in src/modules/leads, later it's the structured "basic quote" feature scaffolded in src/modules/quotes. Defines what a basic quote may and may not include for this MVP. Not needed for catalog display or filtering work.
---

# Vehicle quote generation (basic, MVP scope)

"Cotizaciones básicas" in this project means: a clear, correct summary of
**what vehicle, at what price, from whom** — nothing more. This skill exists
so quote-related work (today's WhatsApp message, tomorrow's `quotes` module)
stays consistent and doesn't silently grow financing/payment features that
are explicitly out of scope (see root `CLAUDE.md` and
`docs/architecture.md`).

## What a basic quote MUST include

- Vehicle identity: brand, model, year (from `Vehicle` in
  `src/modules/inventory/domain/vehicle.ts`).
- Price, formatted with currency and locale-appropriate separators — reuse
  `src/modules/inventory/presentation/components/PriceTag.tsx`'s
  `Intl.NumberFormat` approach and `src/shared/i18n/format.ts`'s
  `numberLocale()`, don't hand-roll number formatting again.
- Dealer contact info (`AGENCY` in `src/shared/config/agency.ts`).
- Language: generated in whatever language (`es`/`en`) the visitor currently
  has selected — use the `t()` function passed in, exactly like
  `buildVehicleInquiryMessage` in
  `src/modules/leads/application/build-whatsapp-inquiry.ts` does today.

## What a basic quote MUST NOT include (until a spec explicitly says otherwise)

- Financing terms, monthly payment estimates, interest rates.
- Credit scoring or any credit-worthiness signal.
- Payment processing / checkout of any kind.
- Trade-in valuation math (that's a separate, unbuilt concern).

If a task description asks for any of the above, stop and flag it — it's
project-wide out of scope per the MVP constraint, not a quotes-module
decision.

## Today's implementation (the reference to extend)

`src/modules/leads/application/build-whatsapp-inquiry.ts`:

```ts
export function buildVehicleInquiryMessage(vehicle: Vehicle, t: Translate): string {
  return t("detail.inquiryMessage", {
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    price: vehicle.price,
  });
}
```

This *is* today's "quote" — a pre-filled WhatsApp message, not a document.
When `src/modules/quotes` (currently just a README scaffold) gets built into
a real structured quote (e.g. a printable/shareable quote view), it should:

1. Live in `src/modules/quotes/application/generate-quote.ts` as a pure
   function taking a `Vehicle` and returning a `Quote` domain object —
   mirror the layering `inventory` already uses.
2. Reuse `buildVehicleInquiryMessage`'s formatting conventions rather than
   duplicating them.
3. Get a spec under `.claude/specs/` (use
   `.claude/templates/spec-template.md`) before implementation — this is a
   real feature addition, not a tweak.

This is joint `sales-lead-agent` / `inventory-agent` territory — see
`.claude/agents/`.
