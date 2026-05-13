## Why

DJs are a key part of the tango community but are not currently browsable in the app. The Tribe Events API exposes organiser records which can include DJs. A DJs page lets users discover who is playing at events and find all events for a given DJ.

## What Changes

- Add new route `src/routes/djs/` with `+page.svelte` and `+page.ts`.
- Load function: fetches organizers from `/wp-json/tribe/events/v1/organizers` and filters/labels those identified as DJs (by category, tag, or naming convention — to be confirmed).
- Desktop: three-column DJ card grid in main column; style/type filter chips in right sidebar.
- Mobile: single-column list.
- Add `fetchOrganizers()` to `src/lib/api/tribe.ts` (or confirm if already present).
- Add nav link "DJs" already included in `LeftSidebar`.

## Capabilities

### New Capabilities

- `desktop-djs`: DJs directory — organizer cards with style filter; links to events by that DJ.

### Modified Capabilities

None.

## Impact

- **New files**: `src/routes/djs/+page.svelte`, `src/routes/djs/+page.ts`
- **Files changed**: `src/lib/api/tribe.ts` (add `fetchOrganizers` if missing), `src/lib/types.ts` (confirm `TribeOrganizer` type)
- **New API endpoint**: `/wp-json/tribe/events/v1/organizers`
- **Depends on**: `desktop-layout-foundation`
- **Stitch reference**: https://stitch.withgoogle.com/projects/6101620989348291389 (DJs screen)
