## Why

Tango venues ("Tanzräume") are not browsable in the app. A Venues page lets users discover where events are held, understand the venue character, and find events at a specific venue — particularly useful for newcomers and visitors to the Rhein-Neckar region.

## What Changes

- Add new route `src/routes/tanzraeume/` with `+page.svelte` and `+page.ts`.
- Load function: fetches venues from `/wp-json/tribe/events/v1/venues`.
- Desktop: two-column venue card grid; right sidebar shows a city/location filter.
- Mobile: single-column list.
- Add `fetchVenues()` to `src/lib/api/tribe.ts`.
- Add/confirm `TribeVenue` type in `src/lib/types.ts`.
- Nav link "Tanzräume" already in `LeftSidebar`.

## Capabilities

### New Capabilities

- `desktop-venues`: Tanzräume (venues) directory — venue cards with address and event count; desktop has location filter sidebar.

### Modified Capabilities

None.

## Impact

- **New files**: `src/routes/tanzraeume/+page.svelte`, `src/routes/tanzraeume/+page.ts`
- **Files changed**: `src/lib/api/tribe.ts` (add `fetchVenues`), `src/lib/types.ts`
- **New API endpoint**: `/wp-json/tribe/events/v1/venues`
- **Depends on**: `desktop-layout-foundation`
- **Stitch reference**: https://stitch.withgoogle.com/projects/6101620989348291389 (Tanzräume screen)
