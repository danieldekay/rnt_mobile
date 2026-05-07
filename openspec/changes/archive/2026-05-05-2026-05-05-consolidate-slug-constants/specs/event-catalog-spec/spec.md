## ADDED Requirements

### Requirement: All event-type and music-type mappings live in a single shared module
The app SHALL provide a single constants module at `$lib/constants.ts` that exports all event-type category slugs, music-type category slugs, type names, badge classes, filter classes, and music type names.

### Requirement: All existing consumers import from the consolidated module
After consolidation, `src/lib/api/tribe.ts`, `src/lib/stores/events.svelte.ts`, and `src/lib/utils/event-presentation.ts` MUST import slug maps from `$lib/constants.ts` instead of defining their own copies.

### Requirement: All slug values are preserved exactly
- **WHEN** any consumer reads `EVENT_TYPE_SLUGS.milonga` or `MUSIC_SLUGS.traditional`
- **THEN** the returned string values are identical to what was hardcoded before consolidation

### Requirement: No behavioral changes in API queries or filtering
- **WHEN** an event-type filter or music-type filter is toggled in any screen
- **THEN** the resulting WordPress API category query string and client-side filtering behave identically to before consolidation
