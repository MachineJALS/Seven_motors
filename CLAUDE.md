# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this project is

Seven Motor is a car dealership in Tilarán, Guanacaste, Costa Rica. This repo
is their catalog website: React 19 + Vite + TypeScript, statically built,
deployed to Cloudflare Pages for $0 infrastructure cost. There is currently
no backend — vehicle data is a hardcoded array. Full context: `docs/architecture.md`
(target architecture) and `docs/audit-report.md` (state before this
restructuring).

**MVP scope**: catalog browsing, filtering, vehicle detail, and a WhatsApp
inquiry channel. Payments, financing, and credit scoring are explicitly
**out of scope** project-wide — don't add them unless a spec in
`.claude/specs/` explicitly calls for it. The architecture is laid out so
they *can* be added later without restructuring, not so they get built now.

## Language rules

- Code identifiers, comments, commit messages, and everything under `docs/`
  and `.claude/` are in **English**.
- Customer-facing UI is **bilingual** (Spanish/English) via `react-i18next` —
  see `src/shared/i18n/`. Every string a visitor can see must have both an
  `es` and `en` key in `src/shared/i18n/locales/{es,en}/common.json`.
- Exception: vehicle `description` text (dealer-entered, per-vehicle) stays
  Spanish-only for the MVP — see `docs/architecture.md` for why.

## Structure

```
src/
  app/            entry point + routing
  modules/        domain modules (inventory, leads implemented; quotes, admin scaffolded)
    <domain>/
      domain/           types & pure business rules
      application/      use-cases, framework-free
      infrastructure/   data access (swap this layer to change data source)
      presentation/     React components & pages
  shared/         config, i18n, cross-cutting UI (Header/Footer), styles
```

Use the `@/` path alias for imports (`@/modules/inventory/domain/vehicle`),
configured in `vite.config.ts` and `tsconfig.app.json`.

## Commands

- `npm run dev` — local dev server
- `npm run build` — `tsc -b && vite build`; must pass before considering work done
- `npm run lint` — oxlint; must pass before considering work done
- No test runner is configured yet — verify changes via build + lint + manual
  `npm run dev` smoke testing (see the relevant spec's "Test plan" section)

## Skills, Agents, and Spec Driven Development

This repo uses three Claude Code artifact types, documented in full in
`docs/architecture.md`:

- **`.claude/skills/*/SKILL.md`** — procedures to follow for specific kinds of
  work (VIN handling, inventory filtering, quote generation). Load
  automatically when relevant; read one before touching its topic.
- **`.claude/agents/*.md`** — subagents specialized per domain
  (`inventory-agent`, `sales-lead-agent`, `customer-service-agent`). Delegate
  module-scoped work to the matching agent rather than doing it inline when
  the task is substantial.
- **`.claude/specs/*/spec.md`** — feature specs written before implementation
  for anything beyond a small fix. Copy `.claude/templates/spec-template.md`
  to start a new one. See `.claude/specs/vehicle-inventory-management/spec.md`
  for a filled example.

Flow for a new non-trivial feature: **spec → design → implement → verify**
(build + lint + manual test per the spec's test plan) — don't skip straight
to code for anything that adds a new module, a new data shape, or changes a
user-facing contract.

## Conventions worth knowing

- Layering is one-directional: `presentation` depends on `application`
  depends on `domain`; `infrastructure` implements `domain` contracts.
  `leads` may depend on `inventory`'s domain types; `inventory` never depends
  on `leads`.
- Filtering/business logic belongs in `application/`, never inside a React
  component — see `src/modules/inventory/application/filter-vehicles.ts`.
- Enum-like fields (`fuelType`, `transmission`) are stored as English codes
  and rendered via `t(\`enums.<field>.${value}\`)` — never display a raw
  stored enum value directly.
- Follow the repo-wide engineering defaults: no speculative abstractions, no
  comments explaining *what* code does (only non-obvious *why*), validate
  only at system boundaries.
