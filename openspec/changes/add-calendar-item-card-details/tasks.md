# Tasks: add-calendar-item-card-details

## 1. Test Coverage

- [x] 1.1 Add `src/lib/components/EventCard.test.ts` coverage for recognized supplemental markers such as live music or show.
- [x] 1.2 Add `src/lib/components/EventCard.test.ts` coverage that missing or unrecognized marker metadata renders no empty placeholder row.

## 2. Event Card Highlight Mapping

- [x] 2.1 Extend `src/lib/constants.ts` with the approved supplemental highlight slug and label mapping.
- [x] 2.2 Extend `src/lib/utils/event-presentation.ts` with a helper that returns the supplemental markers for a `TribeEvent` from category metadata.

## 3. Shared Card UI Implementation

- [x] 3.1 Update `src/lib/components/EventCard.svelte` to render a compact supplemental marker row while preserving the existing logistics-first mobile hierarchy.
- [x] 3.2 Verify the updated `EventCard` output remains consistent on both `/` and `/kalender` because both routes already consume the shared component.

## 4. Validation

- [x] 4.1 Run the focused Vitest coverage for `src/lib/components/EventCard.test.ts`.
- [x] 4.2 Run `npm run check` in `rnt_mobile`.
