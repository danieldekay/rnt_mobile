## Why

The entity detail pages (`/veranstalter/[slug]`, `/djs/[slug]`) load slowly because they fetch ALL events across all pages from the WordPress Events API using `fetchAllEvents`, only to filter down to a small subset. This causes:
- Unnecessary network requests per page (5+ pages of events per 30-day window)
- Long load times especially on mobile connections
- Poor user experience when browsing organizers or DJs

## What Changes

- **New `fetchOrganizerEvents` API function**: Fetch only events for a specific organizer via the WordPress REST API, reducing the data payload
- **Update `/veranstalter/[slug]` load function**: Use `fetchOrganizerEvents` instead of `fetchAllEvents` + client-side filtering
- **Keep DJ page optimization potential**: The DJ page still needs `fetchAllEvents` for event filtering by DJ name. A future improvement could add a DJ-specific filter at the API level, but for now the scope is limited to the organizer page

## Capabilities

### New Capabilities
- `fetch-organizer-events-api`: New API function to fetch events filtered by organizer ID directly from WordPress REST API, avoiding the full event list traversal

### Modified Capabilities
- (none)

## Impact

- **API changes**: New endpoint `/wp-json/tribe/events/v1/events?organizer=<id>` is already supported by the Events Calendar plugin — no WordPress plugin changes needed
- **Code changes**: `src/lib/api/tribe.ts` (add function), `src/routes/veranstalter/[slug]/+page.ts` (use new function)
- **No prerendering impact**: Both routes are already `prerender = false`
- **Deployment**: Standard static build, no Cloudflare Pages changes
