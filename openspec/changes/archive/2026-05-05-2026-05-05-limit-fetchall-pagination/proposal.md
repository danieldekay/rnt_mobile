## Why

When the calendar page loads in "all" date mode, `fetchAllEvents()` issues sequential API requests until the WordPress API returns `total_pages == page`. If the API returns stale or incorrect `total_pages` (e.g., a large number that doesn't correspond to actual data), the loop runs indefinitely, blocking the page and consuming API quota. There is currently no page cap, no request timeout, and no `AbortController` to bound the fetch.

Adding a bounded pagination cap and a request timeout protects against runaway API consumption and ensures the calendar page always becomes interactive.

## What Changes

- Add a configurable maximum page count (default 10) to `fetchAllEvents()` in `src/lib/api/tribe.ts` to prevent runaway pagination.
- Add an `AbortController` with a 2-minute timeout to `fetchAllEvents()` to bound total fetch duration.
- Gracefully handle the AbortError: return whatever events have been collected so far.

## Capabilities

### Modified Capabilities
- `event-fetching`: Bounds `fetchAllEvents()` with a maximum page count (10) and a global timeout (2 minutes) to prevent runaway pagination and ensure the calendar page always becomes responsive.

## Impact

- Affected files: `src/lib/api/tribe.ts` only.
- The calendar page's `setDateFilter('all')` call in `calendar/+page.svelte` is unaffected; bounded fetch replaces unbounded fetch.
- No deployment-model changes.
