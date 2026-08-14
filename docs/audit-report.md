# Audit Report — Agencia Autos (Seven Motor)

**Date**: 2026-08-14
**Scope**: full repository as it existed before the architecture restructuring
described in `docs/architecture.md` and `docs/migration-plan.md`.

## Summary

This is a real, "Phase 1" static catalog site for a single car dealership —
React 19 + Vite + TypeScript, 15 source files, ~600 lines, no backend, no
tests, no CI, and (before this work) no local git history at all. It is
smaller and earlier-stage than the request that triggered this audit assumed
(no leads system, no quotes, no admin panel exist yet — the project's own
README already scheduled those for "Phase 2"). Findings below are scoped to
what actually exists.

## Critical

### 1. The project did not compile before this restructuring

`src/data/vehiculos.ts` contained a malformed trailing entry:

```ts
// Vehículos con fotos
{

}
```

An empty object literal against the `Vehiculo` interface fails TypeScript's
structural check (`error TS2740: Type '{}' is missing the following
properties from type 'Vehiculo': id, marca, modelo, anio, and 7 more.`).
Verified directly: `tsc -b --noEmit` on the pre-restructure code fails with
exactly this error. `npm run dev` still works (Vite's dev server doesn't
type-check), which likely masked this for a while — but `npm run build`
(the command actually used to deploy to Cloudflare Pages) would have failed.
**This means the last deploy, if one happened after this entry was added,
was either stale or built from a different commit.** The entry was dropped
(not fixed) during the restructuring — see `docs/migration-plan.md`.

This also means the README's claim of "8 autos de ejemplo" was already
stale: the file only ever had 4 complete, valid vehicle entries.

### 2. Vehicle prices mix currencies under a single "USD" field — RESOLVED

**Update**: confirmed with the dealer and fixed as part of
`.claude/specs/supabase-inventory-backend/spec.md` — the 3 higher-magnitude
values were genuinely CRC (colones), not USD; the Elantra had no real listed
price and now uses a dealer-supplied estimate (₡5,621,250, from $12,500 at
₡449.70/$1). All prices are now normalized to CRC and the site displays `₡`
instead of `$`. Left below as it was originally written, for the audit trail.

`Vehiculo.precio` is typed and commented `// en USD`, but of the 4 valid
entries:

| Vehicle | `precio` value | Plausible as |
|---|---|---|
| Hyundai Elantra 2017 | 12,500 | USD |
| Toyota Yaris 2008 | 3,300,000 | CRC (colones), not USD |
| Kia Rio Hatchback 2008 | 2,750,000 | CRC (colones), not USD |
| Hyundai Accent Hatchback 2012 | 3,750,000 | CRC (colones), not USD |

Displayed as-is, the site shows a **2008 Toyota Yaris at $3,300,000 USD**.
This is a real trust/business risk for live traffic, not a cosmetic bug. We
did **not** guess-correct these values during the restructuring — the dealer
needs to confirm actual USD asking prices; this report exists to make sure
that happens.

### 3. No version control history

The working directory was not a git repository at all before this session.
There was no way to review history, diff against a known-good state, or
recover from a bad edit. Fixed as part of this work (`git init`, baseline
commit, feature branch) — see `docs/migration-plan.md`.

### 4. Zero test coverage

No test runner is configured. Filtering logic, routing, and data shape have
no automated verification — every change is manually eyeballed. Not fixed in
this pass (out of the agreed scope); flagged for a future spec.

## Important

- **No repository abstraction for data.** The 76-line `vehiculos.ts` array
  doubled as domain type, seed data, and "backend" all at once, imported
  directly by pages. The project's own README already plans a Supabase swap
  in Phase 2; without an infrastructure-layer boundary, that swap would have
  touched every consumer instead of one file. Addressed by the new
  `domain/application/infrastructure/presentation` layering — see
  `docs/architecture.md`.
- **No separation between domain, application, and presentation.** Filtering
  logic (brand/price/year/fuel matching) lived inline inside `CatalogoPage`,
  a React component — untestable in isolation and impossible to reuse
  outside that page. Extracted to
  `src/modules/inventory/application/filter-vehicles.ts`.
- **Lead-capture logic coupled to agency config.** `armarLinkWhatsApp` lived
  in `config.ts` (agency settings), conflating "static business info" with
  "how we capture a customer inquiry" — two concerns that will diverge as
  soon as leads get persisted (Phase 2). Moved to
  `src/modules/leads/application/build-whatsapp-inquiry.ts`.
- **Spanish identifiers throughout code** (`Vehiculo`, `marca`, `precio`,
  `anio`, `combustible`, `transmision`...). Reasonable for a solo Phase-1
  build, but blocks English-language tooling/collaboration and made
  bilingual UI harder to wire cleanly (enum values were stored as
  display-ready Spanish strings, e.g. `"Automática"`, rather than codes).
  Renamed to English identifiers with English enum codes
  (`transmission: "automatic" | "manual"`), rendered through i18n.
- **No path aliases**, so a deeper module structure would have produced
  `../../../..`-style imports. Added `@/` → `src/` in `vite.config.ts` /
  `tsconfig.app.json`.
- **Two known-vulnerable transitive dependencies** surfaced by `npm audit`
  (`nanoid` via the Vite toolchain, `postcss`; also `react-router`/
  `react-router-dom` itself flag a high-severity advisory). All pre-existing,
  not introduced by this work. Not auto-fixed — `npm audit fix` would bump
  `react-router` across a range that needs its own compatibility check, so
  this is left as a follow-up rather than a silent fix.

## Improvements

- `index.html`'s `<title>` was `"Agencia Ejemplo · Autos usados en Costa
  Rica"` — a copy-paste placeholder inconsistent with the real agency name
  in `config.ts` ("Seven Motor"). Fixed.
- `Footer.tsx` had a dangling `{/* Pendiente: enlazar aquí la plantilla de
  aviso de privacidad */}` comment with no tracking artifact — a task
  reference that will rot silently. Removed the comment; if the privacy
  notice link is still needed, it belongs in a spec, not a code comment.
- oxlint is configured (`.oxlintrc.json`) but not wired into any pre-commit
  hook or CI step — nothing currently enforces it beyond a developer
  remembering to run `npm run lint`. Not fixed in this pass (no CI exists to
  wire it into yet).
- `index.html` carries a `<!-- TODO Fase 2: Google Analytics... -->` comment
  — legitimate forward-looking note, left as-is; it's already effectively
  tracked by the project's own Phase 2 plan in the (pre-restructure) README.

## What this audit deliberately did not touch

Per the agreed scope: no payment, financing, or credit-scoring code exists
or was added. No automated test suite was introduced. No CI pipeline was
introduced. These are candidates for future specs, not silent additions.
