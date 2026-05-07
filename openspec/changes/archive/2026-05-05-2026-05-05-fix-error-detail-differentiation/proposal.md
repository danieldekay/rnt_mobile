## Why

`fetchEventById()` in `tribe.ts` catches all errors with a bare `throw new Error(...)`, and the event detail page (`+page.svelte`) sets `error = 'Veranstaltung nicht gefunden'` for ALL failures. Users see "Event not found" for a 500 server error, a network timeout, and a true 404 — making debugging impossible and UX confusing.

## What Changes

- Add HTTP status differentiation in `fetchEventById`'s catch block: distinguish 404 from other errors.
- Update the event detail page to show "Event not found" only for 404, and "Loading failed" for all other errors.
- Track `event_fetch_error: 'not_found'` / `event_fetch_error: 'network'` in Matomo.

## Capabilities

### Modified Capabilities

- `event-detail`: Improved error messaging and observability for event detail fetch failures.

## Impact

- Affected files: `src/lib/api/tribe.ts`, `src/routes/event/[id]/+page.svelte`.
- No WordPress API or data-shape changes.
- No deployment-model changes.
