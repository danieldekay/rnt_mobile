## Why

The app has three identical copies of every event-type and music-type slug mapping across `src/lib/api/tribe.ts`, `src/lib/stores/events.svelte.ts`, and `src/lib/utils/event-presentation.ts`. Adding or correcting a type requires three separate edits, which is a DRY violation that will cause future drift and bugs. Consolidating into a single `$lib/constants.ts` eliminates this duplication with a minimal, focused change.

## What Changes

- Create `src/lib/constants.ts` with all event-type slug maps, music-type slug maps, badge classes, filter classes, and type names as a single module.
- Update `src/lib/api/tribe.ts` to import slug maps from the new constants module instead of defining its own copies.
- Update `src/lib/stores/events.svelte.ts` to import from the new constants module.
- Update `src/lib/utils/event-presentation.ts` to import from the new constants module and remove its private copies.

## Capabilities

### Modified Capabilities
- `event-catalog`: Refactors the event-type and music-type slug / label / class map sources into a single shared module, preserving all existing behavior and TypeScript type safety.

## Impact

- Affected files: `src/lib/constants.ts` (new), `src/lib/api/tribe.ts`, `src/lib/stores/events.svelte.ts`, `src/lib/utils/event-presentation.ts`.
- No API or data-shape changes; the WordPress events feed remains unchanged.
- No deployment-model changes; the app remains adapter-static on Cloudflare Pages.
