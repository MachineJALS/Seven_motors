# Spec: Vehicle Image Management (CMS)

## Status

`in-progress` — approved by the project owner after an architecture review
(see `docs/migration-plan.md` and the conversation that produced this spec).
Implementing in 7 phases; this file is updated as each phase lands.

## Objective

Replace the "paste a URL per line" photo workflow with a real image manager
inside `/admin`: multi-file upload, preview, delete, reorder, primary-image
selection, and per-image alt text — without the admin ever typing a URL or
a filename by hand.

## Module & layer mapping

`src/modules/inventory` (domain: `VehicleImage`; infrastructure: read path
joins `vehicle_images`) and `src/modules/admin` (infrastructure: image
upload/delete/reorder; presentation: the image manager UI inside
`VehicleForm`). `VehicleCard`/`VehicleDetailPage` (inventory/presentation)
consume the resolved image list; no change to their public contract beyond
what "primary image" resolves to.

## Key decision: system-generated storage paths

The project owner initially wanted uploaded files removed entirely because
auto-generated (random UUID) filenames didn't match a manual naming
convention they use elsewhere (`marca_tipo_fecha_numero`). Re-approved after
this alternative: paths are system-generated but **structured**, using the
vehicle's own id (already a real slug like `hyundai-elantra-2017`, not an
opaque id) plus a sequential index:

```
vehicle-photos/<vehicle-id>/1.<ext>
vehicle-photos/<vehicle-id>/2.<ext>
```

This gives real per-vehicle organization without the admin ever typing a
filename — resolves the original objection without reintroducing manual
naming.

## Functional requirements

1. Admin can select multiple image files at once (file picker and/or native
   drag-and-drop), see previews before/after upload, and see per-file
   upload progress/error.
2. Admin can delete an individual image (removes both the `vehicle_images`
   row and the Storage object).
3. Admin can reorder images (up/down controls, keyboard-operable — not
   drag-only, for accessibility); the lowest `sort_order` is the primary
   image, shown on `VehicleCard` and as the default detail-page photo.
4. Admin can edit each image's alt text, pre-filled with an auto-generated
   suggestion (`${brand} ${model} ${year} ${color}`) they can override.
5. Creating a vehicle with photo uploads must not fail the whole vehicle if
   one photo upload fails — the vehicle record is created first, images are
   attached after, each independently.
6. Public catalog/detail pages are unaffected in behavior: same primary
   image on cards, same gallery interaction on detail pages, sourced from
   the new model.
7. Existing vehicles with only legacy `photos: string[]` (no
   `vehicle_images` rows yet) keep displaying those URLs until the admin
   re-uploads real photos through the new manager.

## Non-functional requirements

- **No orphaned Storage files as a matter of course**: every image delete
  removes the Storage object; if that fails, the DB row is left in place
  (fails safe — an orphaned file is harmless, a dangling DB reference to a
  missing file is not).
- **Client-side validation** (file type, size, count) is a UX convenience,
  not the security boundary — Storage RLS policies remain the real
  enforcement, per this project's standing rule (no `service_role` key in
  the client, ever).
- **No new dependencies** for drag-and-drop, image preview, or reordering —
  native browser APIs + existing React/CSS only.
- i18n: every new admin-facing string ships with both `es`/`en` keys.

## Out of scope (this spec)

- Automatic migration/re-upload of the 4 seed vehicles' existing photo
  URLs — they're `placehold.co` placeholders with no real value; the admin
  re-uploads real photos per vehicle at their own pace instead (see "Data
  migration strategy").
- Client-side image compression/format conversion (WebP/AVIF) — noted as a
  possible Phase 4 enhancement, not required for a working v1.
- Multi-role admin, quotes, blog/banners, analytics, SSR/SSG, framework
  changes — all explicitly excluded per the project owner's brief.

## Data & API contracts

```sql
-- vehicle_images (Phase 1)
create table vehicle_images (
  id           uuid primary key default gen_random_uuid(),
  vehicle_id   text not null references vehicles(id) on delete cascade,
  storage_path text not null,
  alt_text     text not null default '',
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);
```

RLS: public `select`; `insert`/`update`/`delete` restricted to
`authenticated` (mirrors `vehicles`). Bucket-level Storage policies from
`0003_storage_policies.sql` already cover write access correctly — no path-
scoped policy needed given the single-admin-role model.

```ts
// src/modules/inventory/domain/vehicle.ts (Phase 2)
interface VehicleImage {
  id: string;
  vehicleId: string;
  storagePath: string;
  url: string; // derived: Storage public URL for storagePath
  altText: string;
  sortOrder: number;
}
interface Vehicle {
  // ...existing fields
  images: VehicleImage[];
  photos?: string[]; // deprecated fallback, see migration strategy
}
```

## Data migration strategy

`vehicles.photos` is **not** dropped in this spec. The read repository
prefers `vehicle_images` when a vehicle has any; otherwise it falls back to
`photos`. No backfill script runs against the current placeholder data —
there's nothing worth migrating. Once every real vehicle has been
re-photographed through the new manager, a follow-up migration can drop
`photos` (tracked here, not executed until confirmed).

## Dependencies

- **Depends on**: `supabase-inventory-backend` spec (vehicles table, shared
  Supabase client), the `vehicle-photos` Storage bucket already created.
- **Skills**: `inventory-search-filtering` unaffected (images aren't
  filterable). No existing skill covers image-upload UX specifically.
- **Agents**: `inventory-agent` owns this module's implementation.

## Acceptance criteria

- [ ] `vehicle_images` table exists with the schema above, RLS enabled and
      correct (public read, authenticated write).
- [ ] Admin can upload, preview, delete, reorder images, and edit alt text
      for any vehicle, without typing a URL or filename.
- [ ] Deleting an image removes both the DB row and the Storage object.
- [ ] `VehicleCard`/`VehicleDetailPage` show the correct primary image /
      full gallery from the new model, falling back to legacy `photos` for
      vehicles not yet migrated.
- [ ] Creating a vehicle survives a failed individual photo upload.
- [ ] `npm run build` and `npm run lint` pass after every phase.
- [ ] No regression in catalog, filters, search, WhatsApp leads, or i18n.

## Implementation notes

**Phase 1**: `supabase/migrations/0004_create_vehicle_images.sql` written
(local-only) and run by the project owner — confirmed live via a direct
query against the project's Supabase instance.

**Phase 2**: `Vehicle.images: VehicleImage[]` added; `photos: string[]`
unchanged/required, no consumer touched. `supabase-vehicle-repository.ts`
joins `vehicle_images`, maps + sorts by `sortOrder`, resolves each image's
public Storage URL. Confirmed live (curl) that the join 400s without the
Phase 1 migration and 200s with it — deployment order matters and was
flagged before pushing.

**Phase 3**: added `inventory/application/resolve-vehicle-photos.ts` —
`resolveVehiclePhotos(vehicle)` implements the fallback strategy (prefer
`images`, else map legacy `photos` to the same shape) in one place, ready
for Phase 6 (`VehicleCard`/`VehicleDetailPage`) to consume instead of each
re-implementing the fallback check. Not wired into any component yet —
confirmed via an unchanged build output hash that it's currently unused/
tree-shaken, as expected for prep-only work.
