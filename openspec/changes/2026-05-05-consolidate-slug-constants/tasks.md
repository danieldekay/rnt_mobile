## CONTEXT

The app currently maintains three duplicate slug-mapping tables (TYPE_SLUGS, MUSIC_SLUGS) across `tribe.ts`, `events.svelte.ts`, and `event-presentation.ts`. Each copy has the same four event types and three music types mapped to WordPress category slugs. This duplication means a type addition or slug correction must be applied in three places, which is error-prone and contradicts the project's stated DRY principle.

The consolidated constants file will serve as the single source of truth for event-type and music-type slug maps, type names, badge classes, and filter classes. It will be imported consistently by all existing consumers.

## ADDED Requirements

### Requirement: All event-type and music-type mappings live in a single shared module
The app SHALL provide a single constants module at `$lib/constants.ts` that exports all event-type category slugs, music-type category slugs, type names, badge classes, filter active/inactive classes, and music type names.

#### Scenario: Consumer imports types instead of duplicating maps
- **WHEN** `tribe.ts` imports `EVENT_TYPE_SLUGS` from `$lib/constants`
- **THEN** `tribe.ts` no longer defines its own `TYPE_SLUGS` or `MUSIC_SLUGS` objects

#### Scenario: Store imports types instead of duplicating maps
- **WHEN** `events.svelte.ts` imports `EVENT_TYPE_SLUGS` and `MUSIC_SLUGS` from `$lib/constants`
- **THEN** the store no longer defines `EVENT_TYPE_CATEGORY_SLUGS` or `MUSIC_CATEGORY_SLUGS`

#### Scenario: Presentation imports types instead of duplicating maps
- **WHEN** `event-presentation.ts` imports slug maps from `$lib/constants`
- **THEN** it no longer defines its own `EVENT_TYPE_SLUGS` or `MUSIC_TYPE_SLUGS`

### Requirement: All existing consumers behave identically after consolidation
- **WHEN** a type filter is applied or a music filter is toggled
- **THEN** the resulting API category query uses the same slug as before consolidation

### Requirement: TypeScript types remain unchanged
- **WHEN** the consolidated constants module is imported
- **THEN** all existing `EventType` and `MusicType` type exports remain unchanged and type-safe

## ADDED Requirements

### Requirement: The new constants module follows the existing Svelte 5 rune pattern
- **WHEN** the constants module is written
- **THEN** it uses plain object exports with no runtime dependencies, matching the existing pattern of `event-presentation.ts`

### Requirement: All existing slug values are preserved exactly
- **WHEN** `typ_milonga`, `typ_practica`, `typ_workshop`, `typ_kurs`, `musik_traditionell`, `musik_gemischt`, `musik_neo-oder-non` are exported from the constants module
- **THEN** each slug string value is identical to the value that existed before consolidation
