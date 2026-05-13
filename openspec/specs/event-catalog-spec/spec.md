# Capability: Event Catalog

## Purpose

Provide a reliable, single source of truth for event-type and music-type slug mappings, type names, badge classes, and filter classes. All consumers import from this shared module instead of maintaining duplicates.

## Requirements

### Requirement: All event-type and music-type mappings live in a single shared module
The app SHALL provide a single constants module at `$lib/constants.ts` that exports all event-type category slugs, music-type category slugs, type names, badge classes, filter classes, and music type names.

#### Scenario: Consumer imports types instead of duplicating maps
- **WHEN** `tribe.ts` imports `EVENT_TYPE_SLUGS` from `$lib/constants`
- **THEN** `tribe.ts` no longer defines its own `TYPE_SLUGS` or `MUSIC_SLUGS` objects

#### Scenario: Store imports types instead of duplicating maps
- **WHEN** `events.svelte.ts` imports `EVENT_TYPE_SLUGS` and `MUSIC_SLUGS` from `$lib/constants`
- **THEN** the store no longer defines `EVENT_TYPE_CATEGORY_SLUGS` or `MUSIC_CATEGORY_SLUGS`

### Requirement: All slug values are preserved exactly
- **WHEN** any consumer reads `EVENT_TYPE_SLUGS.milonga` or `MUSIC_SLUGS.traditional`
- **THEN** the returned string values are identical to what was hardcoded before consolidation

### Requirement: No behavioral changes in API queries or filtering
- **WHEN** an event-type filter or music-type filter is toggled in any screen
- **THEN** the resulting WordPress API category query string and client-side filtering behave identically to before consolidation
