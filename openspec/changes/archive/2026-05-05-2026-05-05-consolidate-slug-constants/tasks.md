## ADDED Requirements

### Requirement: Consolidate duplicate slug maps into shared constants
- [x] 1.1 Verify `src/lib/constants.ts` exports `EVENT_TYPE_SLUGS` and `MUSIC_SLUGS`
- [x] 1.2 Verify `src/lib/api/tribe.ts` imports from `$lib/constants` (no duplicates)
- [x] 1.3 Verify `src/lib/stores/events.svelte.ts` imports from `$lib/constants` (no duplicates)
- [x] 1.4 Verify `src/lib/utils/event-presentation.ts` imports from `$lib/constants` (no duplicates)
- [x] 1.5 Run `npm run check` — no errors or warnings

## COMPLETED Requirements

- [x] 2.1 Verify type-specific filter toggles produce identical API queries before and after consolidation
