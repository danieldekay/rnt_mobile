## Files Changed

- `src/lib/api/tribe.ts` — add `EventFetchError` type with `status: number` field
- `src/routes/event/[id]/+page.svelte` — differentiate error messages

## Approach

1. In `tribe.ts`, change the catch block of `fetchEventById` to throw a typed `EventFetchError` with:
   - `status: number` — the HTTP status from the response (404, 500, etc.) or 0 for network errors
   - `message: string` — human-readable
2. In `+page.svelte`, check `error.status === 404` to set `error = 'Veranstaltung nicht gefunden'`,
   otherwise set `error = 'Laden fehlgeschlagen'`.
3. Track error type in Matomo via `trackFeatureEvent`.

## Design Decisions

- Use a custom error class instead of a string, so the detail page can inspect `status`.
- Keep the existing `EventStore` error string model unchanged — only the detail page needs differentiation.
