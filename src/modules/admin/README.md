# Admin module

Implemented per `.claude/specs/admin-vehicle-management/spec.md`: a `/admin`
panel gated by Supabase Auth (single admin role — see the spec's "Out of
scope" for why the original `admin`/`vendedor` multi-role plan was scoped
down) to create/edit/delete vehicles and toggle sold status, without a code
change + redeploy per update.

- `application/` — `signIn`/`signOut`/`getSession`, vehicle
  create/update/delete use-cases, vehicle-image use-cases (thin re-exports
  over `infrastructure/`).
- `infrastructure/` — `supabase-auth.ts`, `vehicle-write-repository.ts`
  (writes to the same `vehicles` table `inventory` reads from),
  `vehicle-image-repository.ts` (Storage upload/delete + `vehicle_images`
  CRUD, see `.claude/specs/vehicle-image-management/spec.md`).
- `presentation/` — `AuthProvider`/`useAuth`/`ProtectedRoute`, login page,
  vehicle list page, create/edit form, `VehicleImageManager` (drag-and-drop
  upload, preview, delete, reorder, primary image, alt text — embedded in
  the edit form; a new vehicle must be saved once first, since the image
  manager needs a stable vehicle id).

Not implemented (see the spec's "Out of scope"): multi-role permissions,
bulk import. Payments, financing, and credit-scoring features are **not**
planned for this module — see `docs/architecture.md`.
