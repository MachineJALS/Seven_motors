# Leads infrastructure — empty by design

No lead is persisted today; a WhatsApp click is the entire "capture" flow. This
folder is where a future `supabase-lead-repository.ts` lands (Phase 2, see
`docs/migration-plan.md`) once the contact form / WhatsApp click also writes a
`Lead` (see `../domain/lead.ts`) to storage instead of only opening `wa.me`.
