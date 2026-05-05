## Context

The app currently defines event-type and music-type slug mappings in three separate files:
- `src/lib/api/tribe.ts` — `TYPE_SLUGS`, `MUSIC_SLUGS` (used for API queries)
- `src/lib/stores/events.svelte.ts` — `EVENT_TYPE_CATEGORY_SLUGS`, `MUSIC_CATEGORY_SLUGS` (used for client-side filtering)
- `src/lib/utils/event-presentation.ts` — `EVENT_TYPE_SLUGS`, `MUSIC_SLUGS` (used for category slug matching)

These three maps are identical in content but differ in variable naming. The only other data in `event-presentation.ts` (type names, badge classes, filter classes, music type names) is not duplicated elsewhere. The consolidation will move all of this into one file.

## Decisions

### Decision: Single constants file with flat exports
- **Choice:** All slug maps, names, and badge classes live in `$lib/constants.ts` as flat exports.
- **Rationale:** Flat exports are the simplest to import and match the existing pattern in `event-presentation.ts`. No modules, no classes, just objects and records.
- **Alternative:** Namespace or enum-based structure.
- **Why not:** Adds indirection and complexity for a simple lookup table.

### Decision: Import all consumers from the constants module
- **Choice:** `tribe.ts` imports `EVENT_TYPE_SLUGS` and `MUSIC_SLUGS` from constants; it no longer defines its own copies.
- **Rationale:** One file, one truth. Any slug change propagates automatically.
- **Alternative:** Keep a separate "API constants" file and merge only store/presentation.
- **Why not:** That would leave just one duplicate pair, which is half the win. Full consolidation is simpler.
