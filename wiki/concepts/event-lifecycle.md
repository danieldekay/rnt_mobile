---
type: Feature
title: Event Lifecycle
description: How events are fetched from WordPress, cached, filtered, and rendered in the UI.
tags: [events, data-flow, filtering, caching]
sources:
  - id: inventory
    resource: /sources/INVENTORY.md
    title: RNT Mobile Project Inventory
  - id: api-docs
    resource: /sources/API_DOCUMENTATION.md
    title: API Documentation
  - id: agents
    resource: /sources/AGENTS.md
    title: AGENTS.md
generated: { by: agent/copilot, at: 2026-07-25T21:10:00Z }
status: stable
---

# Event Lifecycle

Events flow from the WordPress REST API through the API layer, store, and into UI components.

## Fetch Flow

1. **Trigger**: `eventStore.loadEvents()` called in `onMount` on `/` and `/calendar` routes
2. **Paginated fetch**: `fetchAllEvents()` loops pages from `tribe/events/v1/events`
3. **Normalization**: Each event passes through `normalizeEvent()` — HTML entity decode, whitespace cleanup, venue/organizer cleanup
4. **Caching**: Events cached in store keyed by date filter (heute, 7 Tage, Monat, Alle)
5. **Race prevention**: `activeRequestId` ensures only the latest fetch updates the store

## API Layer

The `src/lib/api/tribe.ts` module exports:

| Function | Purpose |
|----------|---------|
| `fetchEvents()` | Paginated event list with date range, type/music filters |
| `fetchAllEvents()` | Full-paginated event list (loops all pages) |
| `fetchEventById()` | Single event by ID |
| `fetchOrganizerEvents()` | Events for a specific organizer |
| `fetchNextEventsRange()` | Next events within a date range |
| `formatEventCost()` | Price formatting ("Frei", "12.50€") |
| `extractDjFromDescription()` | Regex: pulls `DJ: Name` from description |
| `extractWorkshopFromDescription()` | Regex: pulls `Workshop: Name` from description |

## Normalization Pipeline

Each event passes through `normalizeEvent()` which:
- Decodes HTML entities (via `he` library)
- Normalizes whitespace
- Strips HTML to plain text for excerpts
- Normalizes image URLs
- Normalizes euro amounts and coordinates
- Normalizes website URLs
- Replaces obfuscated email markup

## Client-Side Filtering

All filtering happens in `eventStore` (no server params for filters):

- **Type filter**: Milonga, Practica, Workshop, Kurs (via `EVENT_TYPE_SLUGS`)
- **Music filter**: Traditionell, 50%, Neo (via `MUSIC_SLUGS`)
- **Date filter**: Heute, 7 Tage, Monat, Alle
- **Search**: Full-text across title, venue, DJ, description

## Store Architecture

`eventStore` is a Svelte 5 rune-based store (`src/lib/stores/events.svelte.ts`):

```typescript
// Svelte 5 runes
let events = $state<TribeEvent[]>([]);
let filters = $state<Filters>({ types: [], music: [], date: 'all' });
let search = $state<string>('');
let loading = $state<boolean>(false);
let activeRequestId = $state<number>(0);
```

## Event Detail View

The `/event/[id]` route:
- Fetches single event via `fetchEventById()`
- Renders share button (Web Share API + clipboard)
- Calendar export (`.ics` file creation via `createEventCalendarIcs()`)
- Inline Leaflet map (lazy-imported)
- DJ/organizer extraction from description

## Enhanced Data Models

The `EnhancedOrganizer` and `EnhancedVenue` interfaces extend base WP data with:

- Contact info (phone, email, address, city, postal code, country)
- Social media links (facebook, instagram, twitter, youtube, spotify, soundcloud)
- Media assets (logo, banner, gallery, avatar)
- Statistics (event_count, follower_count, verification_status)
- SEO metadata (meta_title, meta_description, focus_keywords)
- Relationships (related_organizers, featured_events)

## Cross-References

- [Architecture](/concepts/architecture.md) — system-level structural decisions
- [Data Models](/concepts/data-models.md) — TypeScript interface definitions
- [API Layer](/concepts/api-layer.md) — full API module documentation
- [Component System](/concepts/component-system.md) — how events render in components
