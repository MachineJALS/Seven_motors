# Architecture — Agencia Autos (Seven Motor)

This document describes the target architecture adopted in this repository:
a domain-driven module structure plus three Claude-Code-native pillars —
**Skills**, **Agents**, and **Spec Driven Development (SDD)**. It also
records the scoping decisions made along the way, so they read as deliberate
choices rather than gaps.

See `docs/audit-report.md` for the state this replaced, and
`docs/migration-plan.md` for how to get from here to Phase 2.

## Scope: MVP, explicitly

This architecture supports **catalog browsing, filtering, vehicle detail,
and a WhatsApp inquiry channel**, bilingual (Spanish/English).

**Explicitly out of scope, project-wide, until a spec says otherwise:**
payment processing, financing calculators, and credit scoring. Nothing in
this structure assumes they're coming soon — the module boundaries (below)
are simply drawn so that adding them later is additive (a new module, or new
files inside `quotes`/`admin`) rather than a rewrite.

## Module structure

```
src/
  app/                        entry point (main.tsx) + routing (App.tsx)
  modules/
    inventory/                 IMPLEMENTED — Supabase-backed
      domain/                   Vehicle, FuelType, Transmission
      application/              filterVehicles, listBrands, listFuelTypes
      infrastructure/           supabase-vehicle-repository.ts
      presentation/              CatalogPage, VehicleDetailPage, VehicleCard, FilterBar, PriceTag, useVehicles/useVehicle hooks
    leads/                      IMPLEMENTED (WhatsApp + passive lead logging)
      domain/                   Lead
      application/               build-whatsapp-inquiry.ts, record-lead.ts
      infrastructure/            supabase-lead-repository.ts (public insert only)
      presentation/               WhatsAppButton, WhatsAppIcon
    admin/                      IMPLEMENTED — single admin role (see admin-vehicle-management spec)
      application/               auth.ts, vehicle-admin.ts, leads-admin.ts
      infrastructure/            supabase-auth.ts, vehicle-write-repository.ts, lead-read-repository.ts
      presentation/               AuthProvider/useAuth/ProtectedRoute, login/list/form/leads pages
    marketing/                  IMPLEMENTED — content pages, presentation/ only (see src/modules/marketing/README.md)
      presentation/               HomePage, FinancingPage, AboutPage
    quotes/                     SCAFFOLD ONLY — README + spec pointer, no code
  shared/
    config/                     AGENCY constants, buildWhatsAppLink
    i18n/                       i18next setup, es/en dictionaries, LanguageSwitcher
    infrastructure/             shared Supabase client
    ui/                         Header (with nav), Footer, NotFoundPage (cross-cutting)
    styles/                     index.css
```

**Why `quotes` is still just a scaffold**: it's the one piece of the
original Phase 2 plan not yet built (see `docs/migration-plan.md` §4.4) — a
`README.md` explains what belongs there and points at the relevant skill, so
a future contributor finds a documented slot to fill in.

### The four layers, per module

- **`domain/`** — types and pure business rules. No React, no I/O.
- **`application/`** — use-cases: pure functions orchestrating domain logic
  (`filterVehicles`, `buildVehicleInquiryMessage`). Framework-free, easy to
  test in isolation once a test runner exists.
- **`infrastructure/`** — where data actually comes from. Today,
  `static-vehicle-repository.ts` is a hardcoded array. Swapping to Supabase
  in Phase 2 means replacing *this file's internals* behind the same
  exported shape — `domain/`, `application/`, and `presentation/` don't
  change. This is the whole point of the layering: it's what makes the
  Phase 2 migration additive instead of a rewrite.
- **`presentation/`** — React components and pages. Call into `application/`,
  never re-implement its logic, never import `infrastructure/` directly for
  anything other than the current data source.

Dependency direction is one-way: `presentation → application → domain`,
`infrastructure → domain`. Across modules, `leads` may depend on
`inventory`'s domain type (a WhatsApp message needs to know the vehicle's
brand/model/year/price); `inventory` never depends on `leads`.

## Internationalization (ES/EN)

The dealership's customers are Costa Rican and primarily Spanish-speaking;
the original request also asked for an English option for the visible site.
Both are true at once, so:

- **Internal artifacts** — code identifiers, comments, this document, specs,
  skills, agents — are in **English**, for tooling/collaboration.
- **Customer-facing UI chrome** (labels, buttons, headings, empty states, the
  WhatsApp pre-filled message, enum display labels like fuel type/
  transmission) is **bilingual** via `react-i18next`, switchable in the
  header, persisted to `localStorage`. Implementation: `src/shared/i18n/`.
- **Vehicle `description` text stays Spanish-only for the MVP.** These are
  free-text paragraphs the dealer writes per vehicle — translating them
  requires either a translation workflow or per-field dual-language data
  entry, both out of scope right now. The domain type has room to add a
  `descriptionEn?: string` later without a breaking change. This is called
  out explicitly here, and in `.claude/agents/customer-service-agent.md`, so
  it isn't mistaken for incomplete i18n coverage.
- Enum-like data (`fuelType`, `transmission`) is stored as **English codes**
  (`"gasoline"`, `"automatic"`) and rendered through translation keys
  (`enums.fuelType.gasoline`) — this is what makes bilingual display
  possible without duplicating vehicle records per language.

## Skills

A **skill** (`.claude/skills/<name>/SKILL.md`) is a reusable, invokable
procedure Claude Code follows when working on a specific kind of task in this
repo — not code that ships to production, but a documented "how we do this
here" that keeps repeated work consistent across sessions and contributors.

**Implemented for the MVP** (all three are real, usable `SKILL.md` files):

| Skill | Covers |
|---|---|
| `vin-decoder-validation` | VIN format validation (check-digit rule) and decoding via the free NHTSA vPIC API — ready for when VINs are added to vehicle data |
| `inventory-search-filtering` | The filter pattern in `filter-vehicles.ts`, and how to extend it consistently |
| `vehicle-quote-generator` | What a "basic quote" may/may not include, and today's WhatsApp-message reference implementation |

**Cataloged for later, not yet built** (would follow the same format when
needed): a lead-qualification skill (scoring/routing rules once leads
persist), a test-drive-scheduling skill (once that flow exists). Adding
either is: create `.claude/skills/<name>/SKILL.md` with frontmatter
(`name`, `description`) following the pattern of the three above.

## Agents

An **agent** (`.claude/agents/<name>.md`) is a Claude Code subagent — a
specialist invoked **during development**, from a Claude Code session, not a
runtime feature of the live site. This is a deliberate reframing of the
three "autonomous agent" examples in the original brief (an inventory-manager
bot, a customer-service chatbot, a lead-qualifier), which described
*production* AI features. Building those into the live site is explicitly
Phase 2+ and not part of this MVP; what *is* useful now is the same
domain specialization applied to **who works on which part of the codebase**.

| Agent | Owns | Production-feature equivalent (not built) |
|---|---|---|
| `inventory-agent` | `src/modules/inventory/**`, data-integrity checks (e.g. the price-unit bug class) | An automated pricing-anomaly / inventory-sync bot |
| `sales-lead-agent` | `src/modules/leads/**`, `src/modules/quotes/**` | An agent that qualifies and follows up with leads |
| `customer-service-agent` | Bilingual copy & i18n coverage across `presentation/` layers | A customer-facing FAQ/chat assistant |

Each agent's `.md` documents its responsibility, inputs/outputs,
dependencies (which skills/specs it consults), and how it's invoked (Claude
Code's Agent/Task delegation, scoped to specific paths) — read the files in
`.claude/agents/` directly rather than treating this table as exhaustive.

If a genuine production AI feature is ever built (e.g., an actual chat
widget answering customer questions), it would consume the same domain
model these dev-time agents work on top of — but it'd be its own module,
its own spec, and a separate decision, not an extension of these subagent
files.

## Spec Driven Development

Flow: **spec → design → tasks → code → validation.**

1. **Spec** — for anything beyond a small fix (new module, new data shape,
   new user-facing contract), copy `.claude/templates/spec-template.md` into
   `.claude/specs/<feature-slug>/spec.md` and fill it in *before* writing
   code: objective, module/layer mapping, functional & non-functional
   requirements, explicit out-of-scope list, use cases, data/API contracts,
   dependencies (which skills/agents apply), acceptance criteria, test plan.
2. **Design** — resolve architectural questions the spec surfaces (which
   layer owns what, what the API contract with any external service looks
   like) before coding — this is where you'd loop in a human for anything
   ambiguous.
3. **Tasks** — break the spec into concrete implementation steps (a todo
   list, or GitHub issues, depending on workflow).
4. **Code** — implement following the module's existing layering; delegate
   to the relevant `.claude/agents/*` when the task is substantial.
5. **Validation** — run `npm run build` and `npm run lint` (both must pass),
   plus the manual test plan the spec defines (no automated test runner
   exists yet — see `docs/audit-report.md`). Update the spec's acceptance
   criteria checklist and "Implementation notes" section once done.

`.claude/specs/vehicle-inventory-management/spec.md` is a complete worked
example — it documents the one real implemented feature, including the
data-quality issue found while building it and how the layering maps to
actual files.

## Quick guide: adding a new spec / skill / agent

- **New spec**: `cp .claude/templates/spec-template.md .claude/specs/<slug>/spec.md`,
  fill every section, get it reviewed before implementation starts.
- **New skill**: `.claude/skills/<slug>/SKILL.md` with YAML frontmatter
  (`name`, `description` — the description is what triggers Claude Code to
  load it, so make it specific about *when* to use it, per the existing
  three skills' descriptions). Body: the actual procedure, referencing real
  files in this repo, not generic advice.
- **New agent**: `.claude/agents/<slug>.md` with frontmatter (`name`,
  `description`, `tools`, `model: inherit`). Body: responsibility,
  inputs/outputs, dependencies, invocation notes — follow the structure of
  the three existing agent files.

## What's next (not built, deliberately)

See `docs/migration-plan.md` for the concrete Phase 2 steps (Supabase-backed
inventory repository, admin panel with roles, lead persistence, a real
`quotes` UI) and for confirmation that payments/financing/credit-scoring stay
out of scope even in that phase unless a future spec changes that.
