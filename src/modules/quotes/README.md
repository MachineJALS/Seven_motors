# Quotes module — scaffolded, not implemented

Out of scope for the current MVP beyond the WhatsApp inquiry message built in
`src/modules/leads` (which already tells the dealer which vehicle and price
the customer is asking about — a de facto quote request).

A real "basic quote" feature (structured quote text/PDF, no payments or
financing math) is specified ahead of time so it slots into this module
without restructuring: see `.claude/specs/vehicle-inventory-management/spec.md`
for the related inventory contract, and `docs/architecture.md` for the full
module catalog. When built, it follows the same layering as `inventory` and
`leads`: `domain/` (Quote type), `application/` (generateQuote use-case, reuses
the `vehicle-quote-generator` skill), `infrastructure/` (storage, if any),
`presentation/` (quote view/print page).
