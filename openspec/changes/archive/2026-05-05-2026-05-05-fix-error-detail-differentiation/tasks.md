## ADDED Requirements

### Requirement: fetchEventById throws typed EventFetchError with status
- [x] 1.1 Add `EventFetchError extends Error { status: number }` type in `tribe.ts`
- [x] 1.2 Replace bare `throw new Error(...)` in `fetchEventById` catch with `throw new EventFetchError(..., response?.status ?? 0)`
- [x] 1.3 In `+page.svelte`, check `error instanceof EventFetchError && error.status === 404` to set "nicht gefunden"
- [x] 1.4 Track `event_fetch_error: 'not_found'` for 404, `'server_error'` for 5xx, `'network'` for other

## COMPLETED Requirements

- [x] 2.1 Verify user sees "nicht gefunden" for deleted events and "Laden fehlgeschlagen" for 500/network errors
