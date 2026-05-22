# Tasks: Add List Jump And Load More

## 1. Test Coverage

- [x] 1.1 Extend `src/lib/api/tribe.test.ts` with unit coverage for bounded next-range event fetching and append-request failure handling.
- [x] 1.2 Add store tests in `src/lib/stores/events.test.ts` for next-range append, event deduplication, append-specific loading and error state, and reset-on-context-change behavior.
- [x] 1.3 Add component tests in `src/lib/components/ListFooterNavigation.test.svelte` for mobile footer rendering, jump-to-top action wiring, next-period action visibility, and retry feedback.

## 2. Fetching And Store Implementation

- [x] 2.1 Update `src/lib/api/events.ts` and `src/lib/api/tribe.ts` to expose a bounded chronological continuation fetch path that reuses explicit date ranges without re-fetching older windows.
- [x] 2.2 Extend `src/lib/stores/events.svelte.ts` with progressive list-window metadata, append actions, merged chronological sorting, duplicate suppression, and append-specific loading and error fields.

## 3. List Navigation UI

- [x] 3.1 Create `src/lib/components/ListFooterNavigation.svelte` as a reusable mobile-first footer control for jump-to-top and optional next-period actions.
- [x] 3.2 Update `src/routes/+page.svelte` to render the footer at the bottom of the home event list, wire jump-to-top behavior, and append the next 7-day range into the current session list.
- [x] 3.3 Refine the home list footer copy and button states so loading, retry, and unsupported presets stay understandable on mobile without hiding already loaded events.

## 4. Validation

- [x] 4.1 Run `npm run check`.
- [x] 4.2 Run `npm run build`.
