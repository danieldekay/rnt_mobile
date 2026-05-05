## Context

The `fetchAllEvents()` function in `src/lib/api/tribe.ts` currently paginates through ALL result pages from the WordPress Events API:

```ts
while (hasMore) {
    const data = await fetchEvents(types, music, dateFilter, page);
    allEvents.push(...data.events);
    hasMore = page < data.total_pages;
    page++;
}
```

This is called from `calendar/+page.svelte` with `dateFilter: 'all'`, meaning it can fetch hundreds of events across many pages. The calendar page shows events for the entire selected month, but "all" means the API could return events spanning years.

The WordPress API returns `total_pages` in the response, so `hasMore = page < data.total_pages`. If `total_pages` is inflated (which happens when old events are stored in the API), the loop never terminates. There is no timeout — a single `fetchEvents` call could take 10+ seconds, and 100 pages would be ~10 minutes.

The fix: add `maxPages: 10` (meaning at most ~500 events at `perPage: 50`) and an `AbortController` with a 2-minute timeout.

## Decisions

### Decision: Bounded pagination at 10 pages with default 50 per page
- **Choice:** `fetchAllEvents` stops after `page <= 10` even if `total_pages` is higher.
- **Rationale:** 500 events is more than enough for a typical event calendar. 10 pages is a ceiling that prevents runaway pagination while preserving the "load all" behavior.
- **Alternative:** Hardcode maxPages = 5 to be even safer.
- **Why not:** 250 events may not be enough for a popular tango organization. 10 pages (500) is a reasonable default.

### Decision: AbortController with 2-minute timeout
- **Choice:** Create `AbortController` on entry, pass `signal` to each fetch, abort after 2 minutes.
- **Rationale:** Even a single slow fetch or infinite `total_pages` loop is bounded to 2 minutes. A partial result is returned instead of a hung page.
- **Alternative:** Abort after N pages with no time component.
- **Why not:** Time bound handles both infinite loops and slow network independently.

### Decision: AbortError is silently swallowed but events collected so far are returned
- **Choice:** Catch `AbortError`, log it, return `allEvents` (whatever was collected).
- **Rationale:** Returning partial results is better than failing entirely — the calendar page still functions, just with fewer events.
