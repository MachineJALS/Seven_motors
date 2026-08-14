# Spec: {Feature Name}

> Copy this file to `.claude/specs/{feature-slug}/spec.md` and fill in every
> section before writing code. See `docs/architecture.md` for how specs relate
> to skills, agents, and the module structure under `src/modules/`.

## Status

`draft | approved | in-progress | done` — one line, keep it current.

## Objective

One paragraph: what business problem this solves and for whom (the dealer,
the buyer, or both). Say what happens if this is *not* built, so scope
tradeoffs are legible later.

## Module & layer mapping

Which `src/modules/<domain>` this lives in, and which layers it touches
(`domain` / `application` / `infrastructure` / `presentation`). If it spans
more than one module, say which module owns the data and which only consumes
it.

## Functional requirements

Numbered, testable statements ("the system MUST/SHOULD..."). Not
implementation detail — describe observable behavior.

1. ...
2. ...

## Non-functional requirements

Performance, accessibility, i18n (does this feature need both ES/EN copy?),
data-privacy, and browser/device support constraints that apply here
specifically — skip categories that don't apply rather than padding the list.

## Out of scope

Explicitly list what this feature does NOT do, especially anything a reader
might assume it does. For this project: payments, financing, and credit
scoring are out of scope project-wide unless a spec says otherwise.

## Use cases

For each primary flow: actor, trigger, steps, expected outcome, and the
main failure/edge cases (empty state, invalid input, not-found, etc.).

### UC-1: {name}
- **Actor**:
- **Trigger**:
- **Steps**:
- **Success outcome**:
- **Edge cases**:

## Data & API contracts

Type/interface shapes (domain types), and any request/response contracts if
this talks to a backend (Supabase table shape, RPC signature, etc.). Link to
the actual `domain/*.ts` file once it exists instead of duplicating the type.

## Dependencies

- **Skills** this feature should follow (`.claude/skills/...`)
- **Agents** relevant when implementing/reviewing this (`.claude/agents/...`)
- Other specs or modules this depends on or blocks

## Acceptance criteria

Checklist a reviewer can tick off without reading the implementation:

- [ ] ...
- [ ] ...

## Test plan

What gets tested and how (unit, manual smoke test steps, or both — this
project currently has no automated test runner, so say explicitly which
checks are manual and how to perform them, e.g. `npm run build`, `npm run
lint`, `npm run dev` + steps).

## Implementation notes

Filled in *during* implementation, not before — decisions made, deviations
from the spec and why, follow-ups spun out into their own spec.
