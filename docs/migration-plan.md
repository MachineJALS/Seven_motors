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

## Phase 4 (future): Supabase backend, admin panel, lead persistence, quotes

Not started — this section is the plan for when it is. Each item is
additive within the existing module structure, which is the reason this
restructuring was done first.

### 4.1 Inventory: swap the static repository for Supabase

- Add a Supabase project; create a `vehicles` table matching the `Vehicle`
  domain type (see `.claude/specs/vehicle-inventory-management/spec.md`
  "Data & API contracts").
- Replace `static-vehicle-repository.ts`'s internals with a Supabase client
  query, exposing the same shape consumers already use (or an async
  `getVehicles()` — pick one and update the spec's contract section
  accordingly before implementing).
- **Risk**: data-migration correctness — the 4 existing vehicles (and their
  currently-wrong prices, see audit finding #2) need to be entered
  correctly, not copy-pasted with the same bug. **Mitigation**: the dealer
  confirms real USD prices as part of data entry, not automated during
  migration.
- **Risk**: `CatalogPage`/`VehicleDetailPage` currently assume synchronous
  data access. **Mitigation**: introduce loading/error states in the
  presentation layer when this lands — a small, contained change because
  `application/` functions already take a `Vehicle[]` as a plain argument
  rather than reaching into infrastructure themselves.

### 4.2 Admin panel (`src/modules/admin`)

- Supabase Auth with `admin`/`vendedor` roles; Row Level Security policies
  gating writes to the `vehicles` (and future `leads`) tables.
- **Risk**: RLS policy gaps are a real data-exposure risk (e.g. a
  `vendedor` role able to read other dealers' data if this ever becomes
  multi-tenant, or leads visible without auth). **Mitigation**: write RLS
  policies as part of the spec's acceptance criteria, not as an
  afterthought — a spec is required before this module gets real code (see
  `src/modules/admin/README.md`).
- **Risk**: auth/session handling is new surface area for a codebase with
  none today. **Mitigation**: keep it inside `infrastructure/` +
  `presentation/` of the `admin` module; don't leak auth state into
  `inventory`/`leads`.

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

### Acceptance criteria for Phase 4 (to define per sub-feature)

Each of 4.1–4.4 should get its own spec (via
`.claude/templates/spec-template.md`) with its own acceptance criteria
before implementation — this document intentionally doesn't pre-define them
in detail, since the concrete contracts (Supabase schema, RLS policies,
auth flow) should be designed at that time, not guessed now.
