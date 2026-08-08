# Design: Add Favorites

## Context

The app has no user accounts. Consent preferences already use durable `localStorage` (`rnt-consent`). Events load from the Tribe REST API; recurring occurrences share a `slug` but have distinct numeric `id`s. Organizers and venues use numeric `id`; DJs use string `slug`.

## Goals / Non-Goals

**Goals:**

- Persist favorites in `localStorage` key `rnt-favorites` with migrate-forward versioning.
- Support event favorites as single occurrence (`eventIds`) or series (`eventSeriesSlugs`).
- Match upcoming events by direct favorite, favorited organizer/venue/DJ, or series slug.
- Expose favorites via home chip and `/favoriten` route.

**Non-Goals:**

- Cloud sync or accounts.
- Venue detail route.
- Server-side series metadata.

## Decisions

### Decision: Split pure logic and reactive store

`src/lib/utils/favorites.ts` holds normalize/migrate/match helpers (unit-testable). `src/lib/stores/favorites.svelte.ts` mirrors consent store patterns for load/persist/toggle.

### Decision: Series identity via slug

TEC REST does not expose `series_id`. Recurring events share `slug` (verified on live API). Series favorites key on `event.slug`.

### Decision: Event add UX shows scope chooser

First add on an event opens a small sheet: “Nur diesen Termin” vs “Alle Termine dieser Reihe”. Remove clears whichever scopes apply.

### Decision: Upcoming favorites filter in EventStore

Extend `Filters` with `favoritesOnly: boolean` and gate `applyFilters()` via `matchesFavoriteEvent`.

## Migration Plan

Ship as client-only. No backend changes. Rollback is a code revert; `rnt-favorites` data remains in localStorage.
