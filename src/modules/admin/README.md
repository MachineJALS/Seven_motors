# Admin module — scaffolded, not implemented

Explicitly Phase 2 per the project's original roadmap: a `/admin` panel with
`admin`/`vendedor` roles and Row Level Security, backed by Supabase, to edit
inventory without touching code and to review captured leads.

Payments, financing, and credit-scoring features are **not** planned for this
module even in Phase 2 — see `docs/architecture.md` for the explicit
out-of-scope note. When built, this module follows the same layering as
`inventory`: `domain/` (auth/role types), `application/` (use-cases like
`updateVehicle`, `listLeads`), `infrastructure/` (Supabase auth + repositories),
`presentation/` (admin routes/pages, gated behind auth).
