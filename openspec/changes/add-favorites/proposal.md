# Proposal: Add Favorites

## Why

Repeat visitors want to follow specific milongas, organizers, venues, and DJs without re-searching each visit. A local favorites layer lets them mark entities once and see only upcoming matches on demand.

## What Changes

- Add localStorage-backed favorites for events (single occurrence or series-by-slug), organizers, venues, and DJs.
- Add favorite toggles on cards and detail pages with a German single-vs-series choice for events.
- Add a home **Favoriten** filter chip and a `/favoriten` route showing upcoming matched events plus saved entities.
- Persist favorites across reloads and app updates via versioned schema migration.

## Capabilities

### New Capabilities

- `favorites`: Client-side favorite storage, matching, toggles, and upcoming favorites views.

### Modified Capabilities

- `home-event-browsing`: Home list gains a favorites-only filter chip.
- `stores`: New favorites store with durable localStorage persistence.

## Impact

- Affected routes: `/`, `/kalender`, `/favoriten`, `/event/[id]`, entity list/detail routes.
- Affected modules: `src/lib/stores/favorites.svelte.ts`, `src/lib/utils/favorites.ts`, card components, `src/lib/nav.ts`.
- Deployment: client-only; compatible with adapter-static prerendering.
