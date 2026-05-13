## ADDED Requirements

### Requirement: Add bounds to fetchAllEvents pagination
- [x] 1.1 Create an `AbortController` at the top of `fetchAllEvents()` with an `AbortSignal` for timeout
- [x] 1.2 Set a 2-minute `setTimeout` that calls `controller.abort()`
- [x] 1.3 Add `maxPages = 10` guard: `if (page > maxPages) break;` inside the while loop
- [x] 1.4 Catch `AbortError` specifically and return partial events collected so far
- [x] 1.5 Pass `AbortSignal` to each `fetchEvents` call via a custom URL parameter or wrapper

### Requirement: Bounded fetch does not break existing usage
- [x] 2.1 Calendar page loading 10 pages of events still renders correctly
- [x] 2.1 The home page's default `fetchEvents([], null, 'week', 1, 50)` is unaffected (not fetchAll)
