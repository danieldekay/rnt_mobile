## Context

The `/veranstalter/[slug]` route currently loads all events (all pages from WordPress API) within a 30-day window and filters them client-side to only show events for a specific organizer. This is inefficient since:
1. `fetchAllEvents` paginates through ALL event pages (often 5+)
2. Each page returns ~100 events
3. Only a small fraction belong to the target organizer

The WordPress Events Calendar plugin already supports filtering events by organizer via query parameters on its REST API endpoint.

## Goals / Non-Goals

**Goals:**
- Reduce API calls for the organizer detail page from O(pages) to O(1)
- Only fetch events relevant to the target organizer
- Preserve existing error handling and fallback behavior

**Non-Goals:**
- Modifying the DJ detail page (requires different approach since DJs are extracted from description text, not an organizer ID)
- Changing the WordPress plugin
- Adding caching layer

## Decisions

### 1. Add `fetchOrganizerEvents` function in `tribe.ts`

**Decision**: Create a new exported function `fetchOrganizerEvents(organizerId, fetch)` in `src/lib/api/tribe.ts` that calls `/wp-json/tribe/events/v1/events?organizer=<id>` directly.

**Rationale**: Mirrors the pattern of existing functions like `fetchOrganizers`, `fetchVenues`. Reuses the same base URL and error handling patterns. The Events Calendar PRO plugin supports this endpoint natively.

**Alternatives considered**:
- **Add caching**: Would complicate the static adapter setup; premature for this scope
- **GraphQL**: WordPress site uses REST API, introducing GraphQL would be disproportionate

### 2. Update `/veranstalter/[slug]` to use new function

**Decision**: Replace `Promise.all([fetchOrganizers, fetchAllEvents])` with `Promise.all([fetchOrganizers, fetchOrganizerEvents(organizer.id)])` and remove client-side filtering.

**Rationale**: Cleaner separation of concerns; organizer ID is known after fetching the organizer list.

## Risks / Trade-offs

- **[Risk] WordPress plugin may not support organizer filter** → Mitigation: Verify API endpoint exists in test/dev environment first. The standard Events Calendar plugin supports this query parameter.
- **[Risk] New function diverges from existing patterns** → Mitigation: Follow existing tribe.ts conventions (base URL, error types, normalization)
