# Admin module

Implemented per `.claude/specs/admin-vehicle-management/spec.md`: a `/admin`
panel gated by Supabase Auth (single admin role — see the spec's "Out of
scope" for why the original `admin`/`vendedor` multi-role plan was scoped
down) to create/edit/delete vehicles and toggle sold status, without a code
change + redeploy per update.

- `application/` — `signIn`/`signOut`/`getSession`, vehicle
  create/update/delete use-cases (thin re-exports over `infrastructure/`).
- `infrastructure/` — `supabase-auth.ts`, `vehicle-write-repository.ts`
  (writes to the same `vehicles` table `inventory` reads from).
- `presentation/` — `AuthProvider`/`useAuth`/`ProtectedRoute`, login page,
  vehicle list page, create/edit form.

Not implemented (see the spec's "Out of scope"): multi-role permissions,
photo upload to Supabase Storage (photos are pasted URLs), bulk import.
Payments, financing, and credit-scoring features are **not** planned for
this module — see `docs/architecture.md`.
