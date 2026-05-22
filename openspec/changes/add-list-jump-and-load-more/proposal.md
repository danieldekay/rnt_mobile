# Proposal: Add List Jump And Load More

## Why

On phone-sized screens, long event lists become awkward once a user reaches the bottom: there is no fast way back to the top, and moving beyond the initial 7-day window requires changing the date filter and losing the current reading flow. This change improves list browsing by adding explicit mobile-friendly navigation controls that keep the current list visible while loading the next time slice.

## What Changes

- Add mobile-first list footer controls that let users jump back to the top of a list view after scrolling through loaded results.
- Add a "next period" action for the home event list so users can append the next chronological 7-day window to the already loaded events instead of replacing them.
- Keep appended results in local client state for the current session so users can continue filtering and searching across everything they have already loaded.
- Define loading, duplicate-prevention, empty, and error behavior for progressive list extension so the experience remains understandable on slow or partial API responses.
- Prepare the list navigation pattern as a reusable control for other list-style views without changing prerendering or Cloudflare Pages deployment behavior.

## Capabilities

### New Capabilities

- `progressive-list-browsing`: Mobile-friendly list navigation controls for returning to the top and loading the next chronological result window without discarding already loaded items.

### Modified Capabilities

- `home-event-browsing`: The home list gains persistent bottom-of-list navigation and progressive loading behavior for the 7-day view.
- `event-fetching-spec`: Event fetching gains a bounded way to request the next chronological date slice for list extension without re-fetching the entire history window.
- `stores`: The event store gains session-scoped accumulation and deduplication for appended list ranges while preserving existing filtering and search behavior.

## Impact

- Affected routes/views: `src/routes/+page.svelte` home event list, with the new control designed for reuse in other list views.
- Affected state/API modules: `src/lib/stores/events.svelte.ts` and the event fetcher module that already accepts explicit date ranges.
- Affected UI modules: likely a new reusable list navigation component plus any related button or scroll utility helpers.
- API implications: the app continues using the existing WordPress Events API, but will request smaller explicit future date ranges and merge results client-side.
- Data implications: appended results must be deduplicated by event identity and kept in local in-memory state for the active session.
- Deployment implications: no server-side changes are required; the change must remain compatible with adapter-static prerendering and Cloudflare Pages.
