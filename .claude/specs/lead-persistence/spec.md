# Spec: Lead Persistence

## Status

`approved` — Phase 2 item (`docs/migration-plan.md` §4.3), scoped to passive
click-logging per the project owner's explicit choice (no extra form/friction
in front of the WhatsApp redirect).

## Objective

Every WhatsApp inquiry today is a dead end for record-keeping: the visitor
leaves the site and the dealer has no record of who asked about which
vehicle, or how many inquiries a vehicle got. This logs each WhatsApp click
as a `Lead` (already modeled in `src/modules/leads/domain/lead.ts`) so the
dealer can see inquiry history in `/admin`, without adding any step or delay
to the visitor's path to WhatsApp.

## Module & layer mapping

`src/modules/leads`:
- `domain/lead.ts` — unchanged, already defines `Lead`/`LeadSource`.
- `application/record-lead.ts` — new: `recordLead(input)` use-case.
- `infrastructure/supabase-lead-repository.ts` — new: replaces the
  README-only placeholder, writes to a new `leads` table.
- `presentation/components/WhatsAppButton.tsx` — records a lead on click
  (fire-and-forget, does not block or delay opening WhatsApp).

`src/shared/ui/Header.tsx` also records a lead on click (the generic header
WhatsApp button, `source: "whatsapp-header"`, no `vehicleId`).

`src/modules/admin` gains a read-only leads list (`/admin/leads`) — the only
place leads are visible, since public visitors can create leads but never
read them back (see RLS below).

## Functional requirements

1. Clicking any WhatsApp button (header or vehicle detail) records a `Lead`
   with `source`, `vehicleId` (when applicable), the exact message text, and
   a timestamp — and does **not** delay, block, or alter the WhatsApp
   redirect in any way, including if the write fails.
2. `/admin/leads` (behind the same auth as the rest of `/admin`) lists leads
   newest-first, showing source, vehicle (linked, when present), message,
   and when.
3. Public visitors can create leads but cannot read, update, or delete them
   — enforced by RLS, not just by hiding the UI.

## Non-functional requirements

- **Zero added friction**: no popup, form, or confirmation before WhatsApp
  opens. This was the explicit reason to choose this scope over a
  name-capture form (see the alternative considered below).
- **Resilient**: a failed lead write (network issue, RLS misconfiguration)
  must never prevent or visibly delay the WhatsApp redirect — the write is
  fire-and-forget from the visitor's perspective.
- **i18n**: the admin leads list follows the same `es`/`en` pattern as the
  rest of `/admin`.

## Out of scope

- **Name/phone capture before redirect** — considered and explicitly
  rejected by the project owner in favor of zero friction; revisit only if
  the dealer later decides richer lead data is worth the drop-off cost.
- **Lead status/follow-up tracking** (contacted, converted, etc.) — this
  spec only records that an inquiry happened, not a CRM workflow.
- **Notifications** (email/SMS to the dealer on new lead) — future
  enhancement, not built here.
- Payments, financing, credit scoring — project-wide exclusion.

## Use cases

### UC-1: Visitor clicks WhatsApp about a specific vehicle
- **Actor**: prospective buyer, on a vehicle detail page
- **Trigger**: clicks "Escribir por WhatsApp"
- **Steps**: WhatsApp opens in a new tab (unchanged from before) → in
  parallel, a `Lead` is recorded with `source: "whatsapp-vehicle-inquiry"`,
  the vehicle's `id`, and the inquiry message
- **Success outcome**: dealer later sees this inquiry in `/admin/leads`
- **Edge cases**: the write fails — visitor experience is completely
  unaffected; the failure is silent to them (logged to the console only)

### UC-2: Visitor clicks the general WhatsApp button in the header
- Same as UC-1 but `source: "whatsapp-header"`, no `vehicleId`, message is
  the generic inquiry text.

### UC-3: Dealer reviews leads
- **Actor**: dealer, logged into `/admin`
- **Trigger**: navigates to `/admin/leads`
- **Steps**: sees a list of every recorded lead, newest first
- **Success outcome**: dealer can tell which vehicles are generating
  interest and roughly how many WhatsApp inquiries have come in

## Data & API contracts

```sql
create table leads (
  id          uuid primary key default gen_random_uuid(),
  source      text not null check (source in ('whatsapp-header', 'whatsapp-vehicle-inquiry')),
  vehicle_id  text references vehicles(id) on delete set null,
  message     text not null,
  created_at  timestamptz not null default now()
);
```

RLS (inverted from `vehicles`, see the migration script for the actual
policies): `insert` open to `anon, authenticated`; `select`/`update`/`delete`
restricted to `authenticated`.

```ts
// src/modules/leads/application/record-lead.ts
recordLead(input: { source: LeadSource; vehicleId?: string; message: string }): Promise<void>
```

## Dependencies

- **Depends on**: `supabase-inventory-backend` (reuses the same Supabase
  client and the `vehicles.id` foreign key).
- **Skills**: none directly — this is plumbing, not a filtering/quote/VIN
  concern.
- **Agents**: `sales-lead-agent` owns this module.

## Acceptance criteria

- [ ] `leads` table exists with the schema above; RLS allows public insert,
      blocks public select/update/delete.
- [ ] Clicking either WhatsApp button records a lead with the correct
      `source`/`vehicleId`/`message`.
- [ ] The WhatsApp redirect is unaffected by a failed or slow lead write.
- [ ] `/admin/leads` lists leads newest-first with source, vehicle, message,
      date, gated behind the existing admin auth.
- [ ] `npm run build` and `npm run lint` pass.

## Test plan

Manual (no automated test runner):
1. Run the migration, click a vehicle's WhatsApp button, confirm WhatsApp
   still opens immediately.
2. Log into `/admin/leads`, confirm the click from step 1 appears with the
   right vehicle and message.
3. Click the header's WhatsApp button, confirm a `source: "whatsapp-header"`
   lead appears with no vehicle.
4. `npm run build` + `npm run lint`.

## Implementation notes

_(filled in during implementation)_
