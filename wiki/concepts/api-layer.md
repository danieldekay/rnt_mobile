---
type: API
title: API Layer
description: WordPress REST API integration — endpoints, normalization, error handling, and the enhanced data fetching layer.
tags: [api, wordpress, rest, fetch, normalization]
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

# API Layer

The API layer connects RNT Mobile to the WordPress REST API (The Events Calendar) and handles data transformation.

## WordPress REST API Endpoints

Base URL: `https://www.rhein-neckar-tango.de`

| Endpoint | Purpose |
|----------|---------|
| `/wp-json/tribe/events/v1/events` | Event list (paginated) |
| `/wp-json/tribe/events/v1/events/{id}` | Single event |
| `/wp-json/tribe/events/v1/venues` | Venue list |
| `/wp-json/tribe/events/v1/organizers` | Organizer list |
| `/wp-json/wp/v2/posts` | Blog posts |
| `/wp-json/wp/v2/ankuendigung` | Announcements CPT |
| `/wp-json/wp/v2/dj` | DJ CPT |
| `/wp-json/wp/v2/pages` | Legal pages |

## Module Structure

```
src/lib/api/
  tribe.ts              ← Re-exports from split modules
  normalizers.ts        ← HTML decode, text normalize, image/coordinate/URL normalize
  events.ts             ← fetchEvents, fetchAllEvents, fetchEventById, formatDate
  venues.ts             ← fetchVenues, fetchEnhancedVenues, normalizeVenue
  organizers.ts         ← fetchOrganizers, fetchEnhancedOrganizers, normalizeOrganizer
  djs.ts                ← fetchDjCptList, fetchDjCptBySlug, extractDjFromDescription
  legal.ts              ← Legal page fetcher (WP pages by slug)
```

## Key Exports

### Events

| Export | Description |
|--------|-------------|
| `fetchEvents()` | Paginated event list with date range, type/music filter params |
| `fetchAllEvents()` | Full-paginated event list (loops all pages) |
| `fetchEventById()` | Single event by ID |
| `fetchOrganizerEvents()` | Events for a specific organizer |
| `fetchNextEventsRange()` | Next events within a date range |
| `formatEventCost()` | Price formatting ("Frei", "12.50€") |
| `getDateRange()` | Calculate date range from filter |
| `getContinuationDateRange()` | Date range for continuation fetch |

### Venues

| Export | Description |
|--------|-------------|
| `fetchVenues()` | Basic venue list |
| `fetchEnhancedVenues()` | Venues with enhanced metadata |
| `normalizeVenue()` | Normalize venue data |

### Organizers

| Export | Description |
|--------|-------------|
| `fetchOrganizers()` | Basic organizer list |
| `fetchEnhancedOrganizers()` | Organizers with enhanced metadata |
| `normalizeOrganizer()` | Normalize organizer data |

### DJs

| Export | Description |
|--------|-------------|
| `fetchDjCptList()` | Full DJ CPT list |
| `fetchDjCptBySlug()` | Single DJ by slug |
| `extractDjFromDescription()` | Regex: pulls `DJ: Name` from event description |
| `extractWorkshopFromDescription()` | Regex: pulls `Workshop: Name` from event description |

## Normalization Pipeline

All normalizers live in `src/lib/api/normalizers.ts`:

| Function | Purpose |
|----------|---------|
| `decodeHtmlEntities()` | Decode HTML entities via `he` library |
| `normalizeText()` | Whitespace normalization |
| `normalizeHtml()` | HTML structure normalization |
| `stripHtmlToPlainText()` | Convert HTML to plain text |
| `escapeHtmlAttribute()` | Escape HTML attribute values |
| `replaceObfuscatedEmailMarkup()` | Decode obfuscated email markup |
| `normalizeEventImage()` | Normalize event image URLs |
| `normalizeEuroAmount()` | Normalize euro amount strings |
| `normalizeCoordinate()` | Normalize lat/lng coordinates |
| `normalizeWebsiteUrl()` | Normalize website URLs |
| `normalizeEvent()` | Full event normalization pipeline |

## Error Handling

The `EventFetchError` class extends `Error` with a `status` field for HTTP status codes. Error handling utilities in `src/lib/utils/error-handling.ts` provide retry mechanisms with exponential backoff.

## Dev Proxy

During development, `vite.config.ts` proxies API calls to avoid CORS:

```typescript
const DEV_API_TARGETS: Record<string, string> = {
  "/api/posts": "https://www.rhein-neckar-tango.de/wp-json/wp/v2/posts",
  "/api/announcements": "https://www.rhein-neckar-tango.de/wp-json/wp/v2/ankuendigung",
  "/api/events": "https://www.rhein-neckar-tango.de/wp-json/tribe/events/v1/events",
  "/api/venues": "https://www.rhein-neckar-tango.de/wp-json/tribe/events/v1/venues",
  "/api/organizers": "https://www.rhein-neckar-tango.de/wp-json/tribe/events/v1/organizers",
  "/api/dj-cpt": "https://www.rhein-neckar-tango.de/wp-json/wp/v2/dj",
  "/api/links": "http://localhost:8787/api/links",
};
```

## Legal Pages

`src/lib/api/legal.ts` fetches legal pages from WP REST API by slug and sanitizes content with DOMPurify before rendering.

## Cross-References

- [Event Lifecycle](/concepts/event-lifecycle.md) — how API data flows through the app
- [Data Models](/concepts/data-models.md) — TypeScript interfaces for API responses
- [Architecture](/concepts/architecture.md) — system-level structural decisions
