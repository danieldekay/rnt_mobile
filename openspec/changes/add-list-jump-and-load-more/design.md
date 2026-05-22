# Design: Add List Jump And Load More

## Context

The home route in `src/routes/+page.svelte` currently loads one date-filter window and replaces the full event list whenever the user changes the date filter or refreshes. The shared event store in `src/lib/stores/events.svelte.ts` already caches the last fetched window and the API layer already supports explicit `dateRange` input, but there is no concept of progressive range extension, scroll return controls, or reusable bottom-of-list navigation.

This change crosses route UI, state management, and event fetching behavior. It needs a design because the user-visible request depends on coordinating three concerns: a reusable list-footer control, a session-scoped appended-range model in the store, and bounded future-range requests that keep static deployment behavior unchanged.

## Goals / Non-Goals

**Goals:**

- Add a reusable mobile-first list footer pattern that can show a jump-to-top action and, when supported, a next-period action.
- Let the home page append the next 7-day event window to the already loaded list instead of replacing the existing events.
- Keep appended results in client memory for the active session so search and filters continue to work across the combined list.
- Preserve chronological ordering, avoid duplicates, and keep loading and error states explicit during append operations.
- Keep the implementation compatible with Svelte 5 runes, adapter-static prerendering, and Cloudflare Pages.

**Non-Goals:**

- Persist appended ranges across page reloads, devices, or browser restarts.
- Introduce infinite scrolling or background auto-loading when the user reaches the viewport edge.
- Change the calendar route's month-loading model.
- Add a new backend endpoint or alter the WordPress Events API.

## Decisions

### Decision: Introduce a reusable list footer navigation component

Create a small shared component in `src/lib/components` that renders at the bottom of list views and can receive two independent actions: scroll to top and load next range. The home route becomes the first consumer, while other list views can opt in later without duplicating button layout or accessibility text.

Alternative considered: implement route-specific buttons directly in `src/routes/+page.svelte`. Rejected because the user request explicitly targets "any list view" and the pattern is better expressed as a reusable footer control.

### Decision: Track progressive list windows in the event store

Extend `src/lib/stores/events.svelte.ts` with explicit metadata for the currently loaded chronological window, append-in-progress state, and whether more forward browsing is available for the active date preset. The store remains the source of truth for merged events so filtering, search, and counts continue to operate over one combined dataset.

Alternative considered: keep appended events in route-local state. Rejected because it would split filtering and search responsibility between the route and the shared store, making other list consumers harder to support.

### Decision: Reuse explicit date-range fetching instead of expanding `fetchAllEvents` semantics

The API layer already accepts an explicit `dateRange`, so the home route can request the next chronological 7-day slice through a bounded fetch helper rather than re-fetching the original window plus all future events. This keeps requests predictable and avoids coupling progressive browsing to the global `fetchAllEvents` pagination path.

Alternative considered: re-run `fetchAllEvents` with a larger date filter each time the user presses next. Rejected because it would re-download already loaded events, increase latency, and make deduplication and loading feedback less deterministic.

### Decision: Reset appended state when the base list context changes

When the user changes the primary date preset, refreshes the list, or enters a route that uses a different loading model, the store should reset appended-range metadata and treat the newly fetched window as the fresh base list. This keeps the mental model simple: "next period" extends only the current list context.

Alternative considered: preserve appended windows across later filter changes. Rejected because the current home behavior reloads on date changes and users would lose a clear sense of what "next" refers to after switching contexts.

### Decision: Surface append-specific loading and recovery without hiding loaded results

The existing list stays visible while the next period loads. If the append request fails, the already loaded list remains on screen and the footer presents a retryable recovery path. This is preferable on mobile because it avoids blanking out content the user has already earned through scrolling.

Alternative considered: reuse the global loading state and replace the whole list during append. Rejected because it degrades the exact browsing continuity the change is intended to improve.

## Risks / Trade-offs

- Increased store complexity -> Keep progressive metadata narrowly scoped to list extension state and avoid changing unrelated calendar behavior.
- Ambiguous applicability of "next period" outside the 7-day view -> Expose the control as optional, but implement and guarantee the append behavior only for the home page's 7-day preset in this change.
- Duplicate or out-of-order events across adjacent ranges -> Merge by event ID and sort by event start time after each append.
- Longer in-memory lists on mobile devices -> Limit this change to explicit user-triggered appends instead of automatic infinite loading.
- Append errors could feel hidden at the bottom of a long list -> Show inline footer feedback near the action buttons and keep retry affordance colocated with the failure.

## Migration Plan

No data migration or deployment sequencing is required. The feature ships as a client-only change.

Implementation order:

1. Add or update tests for event fetching helpers, store append behavior, and list footer rendering.
2. Extend the store and fetch layer to support bounded next-range loading.
3. Add the reusable list footer control and wire it into the home route.
4. Validate with `npm run check` and `npm run build` because the home route and shared UI behavior change.

Rollback is a normal code revert because no persisted state or backend schema changes are introduced.

## Open Questions

- Whether the "next period" action should be shown only for the 7-day preset or also for `today`, `month`, and `all` with preset-specific labels. This design assumes the first implementation target is the 7-day preset because that is the explicit user request.
- Whether non-home list views should adopt the shared footer immediately or only after the home implementation proves the pattern.
