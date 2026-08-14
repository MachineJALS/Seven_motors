# Git Workflow

This project uses a Git Flow variant, confirmed with the project owner (based
on a workflow used at another company they're familiar with, adjusted with
one addition — see "Amendment" below). **Not yet in effect**: no branches
beyond `main`/`feature/architecture-skills-agents-spec` exist yet. This
document records the agreed shape so it's ready when branching starts.

## Branches

- **`main`** — production. Always deployable; what's live on Cloudflare
  Pages tracks this branch.
- **`develop`** — integration branch. Where finished tickets land before
  being bundled into a delivery.
- **`ticket/<name>`** (feature branches) — one per task/ticket. Branch from
  `develop`, merge back to `develop` when done.
- **`release/<name>`** ("Entregable") — one per delivery/release. Branch from
  `develop` once a set of tickets is ready to ship. Stabilized here.
- **`qa-fix/<name>`** — bug fixes found during QA on a release branch. Branch
  from the `release/*` branch, merge back into it — never touches `develop`
  or `main` directly.
- **`hotfix/<name>`** — urgent production fixes. Branch from `main`, merge
  back into `main`.

## Flow

```
main ──────────────┬─────────────────────────────► main
  │                 ▲                         ▲
  │ branch          │ merge (+ into develop)   │ merge (+ into develop)
  ▼                 │                          │
develop ◄───────────┤                    release/1 ◄──┐
  │  ▲               \                    │            │
  │  │ merge           \ branch            │ branch     │ merge
  ▼  │                  ▼                  ▼            │
ticket/1 ──────────► release/1        qa-fix/1 ─────────┘
                (branch when ready)
```

1. A ticket is picked up: branch `ticket/<name>` from `develop`.
2. Work happens, then `ticket/<name>` merges back into `develop`.
3. When enough tickets are ready to ship, branch `release/<name>` from
   `develop`.
4. QA tests the release branch. Bugs found: branch `qa-fix/<name>` from
   `release/<name>`, fix, merge back into `release/<name>`.
5. Once QA passes, `release/<name>` merges into `main` (this ships it) —
   **and also into `develop`** (see Amendment).
6. If production breaks and it can't wait for the next release: branch
   `hotfix/<name>` from `main`, fix, merge into `main` — **and also into
   `develop`** (see Amendment).

## Amendment: hotfixes and releases also merge back into `develop`

The version of this flow used at the reference company only showed
`hotfix → main` and `release → main`. We're adding one step: **both also
merge into `develop`** after merging into `main`. Reasoning: without this,
a bug fixed via `hotfix/*` or `qa-fix/*` only exists on `main`/the release
branch — the next `release/*` branch, cut fresh from `develop`, wouldn't
include it, and the same bug would ship again. This is standard Git Flow
practice and closes that gap.

## Rules

- Nobody commits directly to `main` or `develop` — always through a branch +
  merge (PR or direct merge, per team size; solo-dev is fine merging
  directly after self-review).
- Delete a branch once it's merged and no longer needed (`ticket/*`,
  `qa-fix/*`, `hotfix/*`, `release/*` once superseded).
- Non-trivial tickets should reference a spec under `.claude/specs/` (see
  `docs/architecture.md` — Spec Driven Development) — the spec doesn't need
  to live in the ticket branch's name, just be linked from the ticket.
