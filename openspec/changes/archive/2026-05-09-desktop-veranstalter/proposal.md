## Why

Event organisers ("Veranstalter") are not currently browsable in the app. Adding a Veranstalter directory page lets users find organisers, understand who runs which events, and browse events by organiser — strengthening community trust and discoverability.

## What Changes

- Add new route `src/routes/veranstalter/` with `+page.svelte` and `+page.ts`.
- Load function: fetches organizers from `/wp-json/tribe/events/v1/organizers`.
- Desktop: two-column organiser card grid in main column; city/region filter in right sidebar plus their upcoming events count.
- Mobile: single-column list.
- Add `fetchOrganizers()` to `src/lib/api/tribe.ts` if not already added by `desktop-djs`.
- Nav link "Veranstalter" already in `LeftSidebar`.

## Capabilities

### New Capabilities

- `desktop-veranstalter`: Veranstalter (organiser) directory — organiser cards; desktop has city filter sidebar.

### Modified Capabilities

None.

## Impact

- **New files**: `src/routes/veranstalter/+page.svelte`, `src/routes/veranstalter/+page.ts`
- **Files changed**: `src/lib/api/tribe.ts` (add `fetchOrganizers` if not done in `desktop-djs`), `src/lib/types.ts`
- **New API endpoint**: `/wp-json/tribe/events/v1/organizers`
- **Depends on**: `desktop-layout-foundation`; coordinate with `desktop-djs` on shared API function
- **Stitch reference**: https://stitch.withgoogle.com/projects/6101620989348291389 (Veranstalter screen)
