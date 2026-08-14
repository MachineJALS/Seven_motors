# Migration Plan

Two migrations are covered here: the restructuring already performed
(Phase 3, executed on the `feature/architecture-skills-agents-spec` branch),
and the future migration to Phase 2 (Supabase, admin panel, lead
persistence, basic quotes) that this architecture was designed to absorb
without a rewrite.

## Phase 3 (done): restructuring to the domain-driven layout

Executed steps, in order:

1. `git init`, baseline commit of the pre-restructure working tree, new
   branch `feature/architecture-skills-agents-spec` — so the prior state is
   always recoverable (`git log`, `git diff <baseline>..HEAD`).
2. Added `i18next` + `react-i18next`; added the `@/` → `src/` path alias.
3. Built `src/shared/{config,i18n,ui,styles}`, moving and renaming
   `config.ts`, `index.css`, `Header/Footer/NoEncontradaPage` into it with
   English identifiers.
4. Built `src/modules/inventory/{domain,application,infrastructure,presentation}`,
   migrating `types.ts`, `data/vehiculos.ts`, the filter logic embedded in
   `CatalogoPage`, and the catalog/detail components — renamed to English
   identifiers and enum codes.
5. Built `src/modules/leads/{domain,application,infrastructure,presentation}`,
   extracting the WhatsApp link-building out of the old `config.ts` and
   modeling a not-yet-persisted `Lead` type.
6. Scaffolded `src/modules/quotes` and `src/modules/admin` as README-only
   placeholders.
7. Rebuilt `src/app/` as the entry point + routing; updated `index.html`'s
   script path and fixed its stale placeholder title.
8. Wired `react-i18next` through every UI string; enum values now render via
   translation keys instead of being stored pre-translated.
9. Added the `.claude/` tree (skills, agents, specs, templates) and this
   documentation set.
10. Verified `npm run build` and `npm run lint` both pass, plus a manual dev
    server smoke test (module graph resolves cleanly, routes serve 200,
    home page and a vehicle detail route both render without errors).

**One data change worth flagging explicitly**: the old `vehiculos.ts` ended
in a malformed empty object that failed `tsc` (see `docs/audit-report.md`
Critical Finding #1). It was dropped, not migrated — the new
`static-vehicle-repository.ts` has exactly the 4 valid vehicle entries the
old file actually had, not the 8 the README described.

### Risks encountered and how they were handled

| Risk | Mitigation |
|---|---|
| Losing the working (if buggy) pre-restructure code | Committed as an honest baseline (`git log` shows it) before any changes, on its own commit, before branching |
| Breaking already-shared vehicle links | Route paths (`/`, `/vehiculo/:id`) and vehicle `id` values were left **unchanged** even though other identifiers were renamed to English — URLs are a public contract, decoupled from internal naming |
| Silent price "fixes" hiding a real business problem | Left price data untouched; documented the inconsistency prominently instead of guessing corrected values |
| i18n coverage gaps | Every string touched during the restructuring was moved behind `t()`; the `customer-service-agent` exists specifically to catch future drift |

### Acceptance criteria for Phase 3 (all met)

- [x] `npm run build` succeeds (tsc + vite).
- [x] `npm run lint` succeeds (oxlint, zero warnings).
- [x] Catalog, filters, vehicle detail, and the WhatsApp inquiry link work
      unchanged in behavior from before the restructuring.
- [x] Every UI string renders correctly in both `es` and `en`.
- [x] No route or vehicle-id changes (link compatibility preserved).
- [x] Git history exists from an honest baseline commit; work happened on a
      feature branch, not directly on `main`.

## Phase 4: Supabase backend, admin panel, lead persistence, quotes

4.1 and 4.2 are **done** (implemented per
`.claude/specs/supabase-inventory-backend/spec.md` and
`.claude/specs/admin-vehicle-management/spec.md`). 4.3 and 4.4 remain future
work. Each item is additive within the existing module structure, which is
the reason this restructuring was done first.

### 4.1 Inventory: swap the static repository for Supabase — done

- `src/modules/inventory/infrastructure/supabase-vehicle-repository.ts`
  replaced `static-vehicle-repository.ts` (deleted), exposing async
  `getVehicles()`/`getVehicleById()` — the one contract change from the
  original plan (sync export couldn't survive an async source), captured in
  the spec.
- The price-currency bug (audit finding #2) is resolved: all 4 vehicles
  migrated with dealer-confirmed CRC prices (see the spec's "Data & currency
  correction" section) via `supabase/migrations/0001_create_vehicles.sql`,
  run by the project owner in the Supabase SQL editor.
- `CatalogPage`/`VehicleDetailPage` gained loading/error states via
  `useVehicles`/`useVehicle` hooks — the risk called out below was real and
  handled as anticipated.

### 4.2 Admin panel (`src/modules/admin`) — done, scoped down

- Supabase Auth with a **single admin role** (not the `admin`/`vendedor`
  split originally planned — see the spec's "Out of scope" for the explicit
  tradeoff; adding a second role later is additive: a `profiles` table +
  tighter RLS, not a rewrite).
- Row Level Security: public `select`, `authenticated`-only
  `insert`/`update`/`delete` on `vehicles` (same migration file as 4.1).
- **Risk**: RLS policy gaps are a real data-exposure risk (writes succeeding
  for unauthenticated requests). **Mitigation**: policies were written and
  tested as part of the migration script, not left to app-level checks
  alone — an unauthenticated `insert`/`update`/`delete` fails at the
  database regardless of what the UI hides.
- **Risk**: auth/session handling is new surface area for a codebase with
  none before this. **Mitigation**: kept inside `infrastructure/` +
  `presentation/` of the `admin` module (`AuthProvider`/`useAuth`/
  `ProtectedRoute`); `inventory`/`leads` have no auth-state dependency.
- **No service_role key anywhere in app code** — admin writes go through the
  authenticated user's session (the same `anon` key + RLS), never a
  privileged server-side key.

### 4.3 Lead persistence (`src/modules/leads`)

- `infrastructure/supabase-lead-repository.ts` writes a `Lead` (already
  modeled in `domain/lead.ts`) whenever a WhatsApp inquiry is sent, or when
  a contact form (not yet built) is submitted.
- **Risk**: writing a lead record before/without confirming the WhatsApp
  message actually sent could produce false-positive leads. **Mitigation**:
  fire the write from a confirmed user action (e.g. the `wa.me` link click),
  not speculatively.

### 4.4 Basic quotes (`src/modules/quotes`)

- Structured quote view/print, per `.claude/skills/vehicle-quote-generator/SKILL.md`.
- **Risk**: scope creep toward financing/payment features. **Mitigation**:
  the skill and this document both state the boundary explicitly; any spec
  proposing financing/payments/credit scoring needs an explicit decision to
  override the project-wide exclusion, not a quiet addition.

### 4.5 i18n coverage drift

As Phase 2 features ship, new strings will be added under time pressure.
**Mitigation**: the `customer-service-agent` (`.claude/agents/customer-service-agent.md`)
exists specifically to review new UI work for missing `es`/`en` keys —
invoke it as part of reviewing any Phase 2 UI change.

### Acceptance criteria for Phase 4

4.1 and 4.2's acceptance criteria live in their own specs (linked above),
per this project's Spec Driven Development flow — see those files, not this
document, for the checklist. 4.3 and 4.4 should each get their own spec the
same way before implementation starts.
