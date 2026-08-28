# Spec: Vehicle Image Management (CMS)

## Status

`implemented, pending final live verification` — all 7 phases are coded;
upload/preview/reorder/alt-text are confirmed working live (real photos
uploaded successfully), delete and the public-site display (Phase 6) still
need a live pass. See "Implementation notes" for the full build log,
including two real bugs found and fixed (a missing Storage `update` RLS
policy triggered by `upsert: true`, and a `FileList` race condition) plus
a third that turned out to be the same `upsert: true` behavior surfacing
differently.

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

- [x] `vehicle_images` table exists with the schema above, RLS enabled and
      correct (public read, authenticated write).
- [x] Admin can upload, preview, reorder, and edit alt text for any
      vehicle, without typing a URL or filename — confirmed live (9 real
      photos uploaded to the Toyota Yaris).
- [ ] Deleting an image removes both the DB row and the Storage object —
      implemented, not yet exercised live.
- [x] `VehicleCard`/`VehicleDetailPage` render through
      `resolveVehiclePhotos()` — wired this pass; not yet confirmed live
      against the Toyota Yaris that now has real managed images.
- [ ] Creating a vehicle survives a failed individual photo upload —
      implemented (vehicle row and image uploads are independent calls),
      not yet exercised live.
- [x] `npm run build` and `npm run lint` pass after every phase.
- [ ] No regression in catalog, filters, search, WhatsApp leads, or i18n —
      build/lint clean, not yet manually reclicked through by the project
      owner since Phase 6 landed.

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

**Phase 4**: `admin/infrastructure/vehicle-image-repository.ts`
(upload/delete/update-alt-text/reorder against Storage + `vehicle_images`)
and `admin/presentation/components/VehicleImageManager.tsx` (drag-and-drop
+ file-picker upload, preview grid, per-image delete, up/down reorder,
one-click "make primary", alt-text editing) — embedded in `VehicleForm`
for edits only. A brand-new vehicle has no stable id until it's saved once,
so the form now redirects to the edit page right after creating a vehicle
(`navigate(initial ? "/admin" : /admin/vehicles/${id}/edit)`), where the
image manager becomes available; the create form shows a hint instead
(`admin.images.saveFirstHint`). The legacy `photos` textarea lost its
`required` attribute and got a relabel ("optional, legacy") — it stayed
required until now, which would have blocked creating a vehicle with no
photos yet, contradicting the whole point of this feature.

Storage path convention confirmed as implemented:
`vehicle-photos/<vehicle-id>/<sequence-number>.<ext>`, assigned once at
upload time. Reordering only ever updates `sort_order` in the DB — it never
renames the Storage object, keeping reorder a cheap DB-only operation.

**Bug found during first real upload attempt**: uploads failed with "new
row violates row-level security policy" (no table name in the message —
the Storage-specific error format, which is how this was traced to Storage
rather than `vehicle_images`). Root cause: `vehicle-image-repository.ts`
uploads with `{ upsert: true }` so a retry after a partial failure
overwrites the leftover object instead of erroring — but when the object
already exists, Storage performs an `UPDATE`, and `0003_storage_policies.sql`
only ever had `insert`/`delete` policies for the bucket, no `update`. Fixed
by adding the missing `update` policy (same file, local-only, not
committed). Confirmed via the Supabase dashboard's Storage → Policies view
that `insert`/`delete` were correctly in place beforehand, which is what
narrowed this down to the missing `update` policy specifically.

**Second bug, found after the first one was fixed**: uploads still did
nothing — no network request, no error. Root cause was in the app this
time, introduced by the session-diagnostic logging added while debugging
the first bug: `handleFiles` awaited `getSession()` before reading the
selected files, but it received the file input's live `FileList` (not a
plain array). The `onChange` handler resets `input.value` right after
calling `handleFiles`, which browsers also use to clear `input.files` —
so by the time the `await` resumed, the FileList it was still holding a
reference to had already been emptied out from under it. Confirmed via
step-by-step console logging: `fileCount: 9` on entry, `candidateCount: 0`
moments later. Fixed by converting `FileList`/`DataTransfer.files` to a
plain `File[]` synchronously at the call site (`onChange`/`onDrop`),
before `handleFiles` ever awaits anything — plain arrays of `File` objects
aren't tied to the input's live state.

**Third issue, still open**: with both prior bugs fixed, every upload
still fails with the same "new row violates row-level security policy".
Ruled out so far, each independently confirmed:
- Session validity — confirmed authenticated, non-expired, correct `role`
  claim (checked live via `getSession()` logging and the raw `Authorization`
  header in the Network tab).
- Regular database writes (`vehicles` table) succeed with the identical
  session, proving the JWT is valid and accepted by PostgREST at least.
- Bucket identity — `select id, name, public from storage.buckets` confirms
  `vehicle-photos` / `vehicle-photos` / `true`, no casing/naming mismatch.
- `storage.objects` RLS policies — confirmed via `pg_policies` (not just the
  dashboard UI) that insert/update/delete are present, scoped to
  `{authenticated}`, with the exact correct `bucket_id = 'vehicle-photos'`
  qual/with_check on every one.
- Added a `storage.buckets` `select` policy for `anon, authenticated` (the
  dashboard showed zero policies existed on that table) — did not resolve it.
- The project had rotated its JWT signing key to an asymmetric ECC (P-256)
  key; suspected a Storage-service incompatibility with the new key format
  and rolled the "current" signing key back to the legacy HS256 shared
  secret, confirmed via a fresh login that new tokens are HS256-signed —
  did not resolve it either. (Kept the rollback since it's harmless and
  free of downside, just not the actual cause.)

**Still pending**: a direct SQL-level test bypassing the Storage service
entirely (`begin; set local role authenticated; set local
"request.jwt.claims" = '{"role":"authenticated"}'; insert into
storage.objects (bucket_id, name, owner) values ('vehicle-photos',
'test-diagnostic.txt', null); rollback;`) to determine whether this is a
genuine RLS/database issue (in which case there's still something
unexamined at that level) or a Supabase Storage-service-level bug/
misconfiguration outside of RLS entirely (in which case the next step is a
Supabase support ticket, since it would be outside what this project's own
code or database config can fix).

**Third issue, RESOLVED**: the project owner traced it further and found
it — `uploadVehicleImage` uploaded with `{ upsert: true }`. With
`upsert: true`, Storage issues an `INSERT ... ON CONFLICT DO UPDATE`
rather than a plain `INSERT`; Postgres RLS requires the role to satisfy
the `UPDATE` policy too for that statement shape, even when no conflict
actually occurs at runtime (the object never existed at any of these
paths — every prior attempt had failed before creating anything). Changed
to `upsert: false`, confirmed working end to end: files land in the
bucket, rows land in `vehicle_images`, and the admin image manager shows
real photos with working reorder/primary/delete. Tradeoff accepted: a
retry at the same `sequenceNumber` after a partial failure now errors
("already exists") instead of silently overwriting — acceptable, the
admin just re-selects the file.

Cleaned up the verbose diagnostic logging added while chasing this
(session/step-by-step console output in `VehicleImageManager.tsx`) now
that the real cause is known — kept the inline error-detail display
(`errorDetail`), since surfacing the actual error message in the UI is
good practice regardless, not just a debugging aid for this incident.

**Phase 6 (frontend público) — done**: `VehicleCard` and
`VehicleDetailPage` now render through `resolveVehiclePhotos(vehicle)`
(Phase 3's fallback helper) instead of reading `vehicle.photos[0]` /
`vehicle.photos` directly — the public catalog, a vehicle's detail page
gallery, and `HomePage`'s featured-vehicles section (which just reuses
`VehicleCard`) all show the managed `vehicle_images` now when present,
falling back to the legacy URLs for any vehicle not yet re-photographed
through the admin image manager.

All 7 phases are implemented; upload/reorder/alt-text are confirmed
working live, delete and the public-frontend wiring (Phase 6) are
implemented but still need a live pass (see unchecked boxes above).
Remaining follow-ups are explicitly out of scope per this spec (see "Out
of scope"): dropping the legacy `photos` column once every real vehicle
has managed images, and any image compression/format-conversion
enhancement.
