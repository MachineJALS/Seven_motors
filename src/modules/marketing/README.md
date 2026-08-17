# Marketing module

Static/content pages that aren't inventory, leads, or admin: `HomePage`
(hero, services summary, featured vehicles, final CTA), `FinancingPage`
(informational — explicitly no data-collection form, see
`.claude/specs/lead-persistence/spec.md` and the project owner's decision to
keep financing/PII collection out of scope), and `AboutPage`.

No `domain/`/`application/`/`infrastructure/` — these pages only read
`AGENCY` config and the `inventory` module's `useVehicles` hook, no business
logic of their own.

**Needs real content before this feels finished** — deliberately not
fabricated:
- `AboutPage`: the "who we are" copy is generic and honest (city, direct
  WhatsApp contact); it doesn't claim a specific founding year, history, or
  team, because those facts weren't provided. Replace `about.storyText`
  (and add a team section) with real copy/photos when available.
- No testimonials section exists yet — building one with fake reviews would
  misrepresent the business; add it once real customer testimonials exist.
- `AGENCY.mapUrl` (`src/shared/config/agency.ts`) is a Google Maps share
  link, not an embeddable map. `HomePage`/`FinancingPage` link out to it
  rather than embedding a real `<iframe>` map. To get a real embed, grab the
  "Embed a map" code from Google Maps' Share dialog for the exact address.
