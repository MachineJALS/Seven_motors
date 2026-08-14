# Spec: Admin Vehicle Management

## Status

`approved` — Phase 2 item, greenlit by the project owner, scoped down from
the original README's `admin`/`vendedor` multi-role plan to a single admin
role for this first cut (explicit tradeoff, see "Out of scope").

## Objective

The dealer doesn't currently have complete data for every vehicle and needs
to add/edit/remove inventory without a code change + redeploy per update.
This gives them a `/admin` screen, gated by login, to manage the `vehicles`
table created by the `supabase-inventory-backend` spec.

## Module & layer mapping

`src/modules/admin` (currently a README-only scaffold — this spec is what
fills it in):
- `domain/` — no new domain type needed; reuses `Vehicle` from `inventory`.
- `application/` — `signIn`/`signOut`, vehicle create/update/delete use-cases.
- `infrastructure/` — Supabase Auth calls, and writes to the `vehicles`
  table via the same Supabase client `supabase-inventory-backend` sets up.
- `presentation/` — login page, protected route wrapper, vehicle list +
  create/edit form, delete confirmation, sold-toggle control.

## Functional requirements

1. `/admin` is not reachable without an authenticated session — an
   unauthenticated visitor is redirected to `/admin/login`.
2. `/admin/login` authenticates via Supabase Auth email+password. No
   self-signup UI — the dealer's one admin account is created directly in
   the Supabase dashboard (Authentication → Users), not through this app.
3. Once authenticated, `/admin` lists every vehicle (including `sold` ones,
   unlike the public catalog which still shows them but marked sold) with:
   create new, edit existing, delete (with a confirmation step), and a
   one-click sold/not-sold toggle.
4. The create/edit form covers every `Vehicle` field: brand, model, year,
   price (CRC), mileage, fuel type, transmission, color, description,
   photos (as one or more pasted image URLs — see "Out of scope"), sold.
5. A visible "sign out" control ends the session and returns to
   `/admin/login`.
6. Writes are enforced server-side by RLS (authenticated-only), not only by
   hiding the UI — even if someone bypasses the client, an unauthenticated
   request to insert/update/delete must fail at the database.

## Non-functional requirements

- **i18n**: admin UI strings follow the same `es`/`en` pattern as the public
  site — the dealer may prefer one language for daily use, but the
  infrastructure should stay consistent with the rest of the app.
- **Session persistence**: a page refresh while logged in should not force
  a re-login (Supabase's client handles this via its own storage — just
  don't fight it with custom logic).
- **No service_role key anywhere in this app's code** — admin writes go
  through the authenticated user's session (RLS `authenticated` policy from
  `supabase-inventory-backend`), never a server-side privileged key.

## Out of scope

- **Multi-role (`admin`/`vendedor`) with different permissions** — the
  original README described two roles; this spec builds one role
  (authenticated = full access) because there's currently one person
  managing inventory. Adding a second role later means: add a `profiles`
  table with a `role` column, and tighten the RLS/UI checks accordingly —
  additive, not a rewrite, because auth is already wired through Supabase.
- **Photo upload / Supabase Storage** — photos are entered as URLs (same as
  today), not uploaded through the admin form. A fast-follow, not needed to
  solve "I don't have complete data yet."
- **Bulk import** (e.g. CSV) — vehicles are entered one at a time.
- Payments, financing, credit scoring — project-wide exclusion.

## Use cases

### UC-1: Dealer logs in and adds a vehicle
- **Actor**: dealer (admin)
- **Trigger**: visits `/admin`, gets redirected to `/admin/login`, signs in
- **Steps**: lands on the vehicle list → clicks "add vehicle" → fills the
  form → submits
- **Success outcome**: new vehicle appears in the admin list immediately and
  on the public catalog on next load
- **Edge cases**: invalid/missing required field (client-side validation
  blocks submit with a clear message); Supabase write fails (network/RLS) →
  error shown, form data not lost

### UC-2: Dealer marks a vehicle as sold
- **Actor**: dealer
- **Trigger**: clicks the sold toggle on a vehicle in the admin list
- **Steps**: toggle flips → write to Supabase → public catalog reflects it
  on next load (badge + disabled WhatsApp button, per the existing
  `vehicle-inventory-management` spec's requirement 5)
- **Success outcome**: no separate "edit form" trip needed for this common
  action

### UC-3: Someone tries `/admin` without logging in
- **Actor**: any visitor
- **Trigger**: navigates to `/admin` directly
- **Steps**: no session found → redirect to `/admin/login`
- **Success outcome**: no vehicle data or admin UI is ever rendered
  unauthenticated, even briefly

## Data & API contracts

Reuses the `vehicles` table from `supabase-inventory-backend`. Auth: Supabase
Auth's standard `signInWithPassword` / `signOut` / `onAuthStateChange`.

```ts
// src/modules/admin/application/*.ts (shape, not final signatures)
signIn(email: string, password: string): Promise<void>
signOut(): Promise<void>
createVehicle(input: Omit<Vehicle, "id">): Promise<Vehicle>
updateVehicle(id: string, input: Partial<Vehicle>): Promise<Vehicle>
deleteVehicle(id: string): Promise<void>
```

RLS policies (defined in the same migration script as
`supabase-inventory-backend`, not duplicated here):
- `select`: public (`anon`, `authenticated`)
- `insert`/`update`/`delete`: `authenticated` only

## Dependencies

- **Depends on**: `supabase-inventory-backend` (table + Supabase client must
  exist first).
- **Skills**: `vehicle-quote-generator` isn't directly relevant here, but
  `inventory-search-filtering` conventions (English enum codes rendered via
  i18n) apply to the admin form's select inputs too.
- **Agents**: joint `inventory-agent` (data shape, RLS correctness) and
  `sales-lead-agent`/`customer-service-agent` are not primary owners here;
  `inventory-agent` is.

## Acceptance criteria

- [ ] `/admin` redirects to `/admin/login` when not authenticated.
- [ ] Login works with an account created directly in Supabase; wrong
      credentials show a clear error, not a crash.
- [ ] Admin list shows all vehicles (including sold), with create/edit/
      delete/sold-toggle all working and persisting to Supabase.
- [ ] A vehicle created/edited in `/admin` appears correctly on the public
      catalog and detail page.
- [ ] Deleting a vehicle removes it from both admin and public views.
- [ ] Writes fail server-side (not just hidden client-side) for
      unauthenticated requests — verified by checking the RLS policy, not
      just the UI.
- [ ] `npm run build` and `npm run lint` pass.

## Test plan

Manual (no automated test runner):
1. Log in with the dealer's Supabase Auth account at `/admin/login`.
2. Create a vehicle, confirm it appears on `/` and `/vehiculo/:id`.
3. Edit it, confirm changes propagate.
4. Toggle sold, confirm the public catalog shows the sold state correctly.
5. Delete it, confirm it disappears from both admin and public views.
6. Sign out, confirm `/admin` redirects to login again.
7. `npm run build` + `npm run lint`.

## Implementation notes

_(filled in during implementation)_
