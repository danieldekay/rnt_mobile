# RNT Mobile — Project Inventory

## Overview

SvelteKit 5 + Svelte 5 static PWA for displaying Rhein-Neckar-Tango events. Fetches from WordPress Events API (The Events Calendar). Deployed to Cloudflare Pages.

Current version: **0.2.0**

---

## Routes

| Route | File | Type | Description |
|-------|------|------|-------------|
| `/` | `src/routes/+page.svelte` | SSR (`prerender: true`, `ssr: true`) | Homepage — event list with filters, search, map toggle |
| `/calendar` | `src/routes/calendar/+page.svelte` | No SSR | Calendar month view with date selector |
| `/event/[id]` | `src/routes/event/[id]/+page.svelte` | No SSR (`prerender: false`, `ssr: false`) | Single event detail view with share, calendar export, inline map |
| `/event/[id]` | `src/routes/event/[id]/+page.ts` | — | Route data loader / config (none — uses `onMount`-only fetch) |
| `/impressum` | `src/routes/impressum/+page.svelte` | — | Legal: Impressum (delegates to `<LegalDocument>`) |
| `/datenschutz` | `src/routes/datenschutz/+page.svelte` | — | Legal: Privacy policy |
| `/cookie-richtlinie` | `src/routes/cookie-richtlinie/+page.svelte` | — | Legal: Cookie policy |
| `/was-ist-neu` | `src/routes/was-ist-neu/+page.svelte` | — | Changelog / release notes |
| `+layout.svelte` | `src/routes/+layout.svelte` | — | App layout: header (nav + PWA install btn), consent banner, PWA update banner, footer |
| `+layout.ts` | `src/routes/+layout.ts` | — | `prerender: true`, `ssr: false` |

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| `Calendar` | `src/lib/components/Calendar.svelte` | Month grid calendar — date navigation, event overlays, highlight today/selected/past |
| `ConsentPlaceholder` | `src/lib/components/ConsentPlaceholder.svelte` | PII-consent gate card (maps) |
| `DateFilter` | `src/lib/components/DateFilter.svelte` | Horizontal date-range button row (Heute, 7 Tage, Monat, Alle) |
| `DateSelector` | `src/lib/components/DateSelector.svelte` | Day-by-day nav bar (← Today →) — used on calendar route |
| `EventCard` | `src/lib/components/EventCard.svelte` | Event list item — date chip, badge, venue, time, price, DJ/organizer, image |
| `FilterChip` | `src/lib/components/FilterChip.svelte` | Type filter chip (Milongas, Practicas, Workshops, Kurse) |
| `LegalDocument` | `src/lib/components/LegalDocument.svelte` | Fetches legal page from WP REST API, renders content with fallback |
| `MusicFilterChip` | `src/lib/components/MusicFilterChip.svelte` | Music filter chip (Traditionell, 50%, Neo) |
| `NewsletterSignup` | `src/lib/components/NewsletterSignup.svelte` | Newsletter form (email + honeypot), POSTs to `/api/newsletter/subscribe` |
| `PwaInstallButton` | `src/lib/components/PwaInstallButton.svelte` | Install CTA in header; opens modal or native prompt |
| `PwaInstallModal` | `src/lib/components/PwaInstallModal.svelte` | Browser-specific installation instructions panel + native prompt trigger |
| `PwaUpdateBanner` | `src/lib/components/PwaUpdateBanner.svelte` | PWA update available / update-check-failed banner |

---

## API Layer

| Module | File | Purpose |
|--------|------|---------|
| `tribe` | `src/lib/api/tribe.ts` | Primary API client — fetches events from WordPress Events Calendar REST |
| `legal` | `src/lib/api/legal.ts` | Legal page fetcher — pulls WP `pages` by slug, sanitizes content |

### tribe — Key Exports

| Export | Type | Description |
|--------|------|-------------|
| `fetchEvents()` | `async function` | Paginated event list with date range, type/music filter params |
| `fetchAllEvents()` | `async function` | Full-paginated event list |
| `formatEventCost()` | `function` | Price formatting ("Frei", "12.50€", etc.) |
| `extractDjFromDescription()` | `function` | Regex: pulls `DJ: Name` from event description |
| `extractWorkshopFromDescription()` | `function` | Regex: pulls `Workshop: Name` from event description |
| `fetchEventById()` | `async function` | Single event by ID |
| `normalizeEvent()` | _internal_ | HTML entity decode, whitespace normalize, venue/organizer cleanup |

---

## Stores

| Store | File | Purpose |
|-------|------|---------|
| `eventStore` | `src/lib/stores/events.svelte.ts` | Svelte 5 writable store — events, filters (types, music, date), search, load/toggle logic |
| `consentStore` | `src/lib/stores/consent.svelte.ts` | GDPR consent preference — essential (always), analytics (Matomo), maps (OSM); persisted in localStorage |
| `pwaInstallStore` | `src/lib/stores/pwa-install.svelte.ts` | PWA install flow — beforeinstallprompt detection, platform detection (`InstallPlatform` type), modal control |
| `pwaUpdateStore` | `src/lib/stores/pwa-update.svelte.ts` | PWA update checking — syncs with SvelteKit `updated`, status text, recovery flow |

---

## Types

| File | Key Exports |
|------|-------------|
| `src/lib/types.ts` | `TribeEvent`, `DateDetails`, `CostDetails`, `Category`, `Venue`, `Organizer`, `EventsResponse`, `EventType`, `MusicType`, `DateFilter`, `Filters` |

### TribeEvent Fields

`id`, `title`, `description`, `excerpt`, `slug`, `url`, `image`, `all_day`, `start_date`, `end_date`, `start_date_details`, `end_date_details`, `timezone`, `timezone_abbr`, `cost`, `cost_details`, `categories`, `venue`, `organizer`, `featured`, `sticky`

---

## Constants

| File | Key Exports |
|------|-------------|
| `src/lib/constants.ts` | `EVENT_TYPE_SLUGS`, `MUSIC_SLUGS`, `EVENT_TYPE_NAMES`, `EVENT_TYPE_BADGE_CLASSES`, `EVENT_TYPE_ACCENT_CLASSES`, `EVENT_TYPE_FILTER_ACTIVE/INACTIVE_CLASSES`, `MUSIC_TYPE_NAMES`, `MUSIC_TYPE_BADGE_CLASSES`, `MUSIC_TYPE_FILTER_ACTIVE/INACTIVE_CLASSES` |

---

## Utils

| Module | File | Key Exports |
|--------|------|-------------|
| `event-actions` | `src/lib/utils/event-actions.ts` | `getEventShareData()`, `getEventCalendarFileName()`, `createEventCalendarIcs()` |
| `event-presentation` | `src/lib/utils/event-presentation.ts` | `getEventType()`, `getEventTypeLabel()`, `getEventTypeBadgeClass()`, `getEventAccentClass()`, `getMusicType()`, `getMusicLabel()`, `getEventMusicLabel()`, `getEventMusicBadgeClass()`, `getMusicFilterClass()` |
| `html` | `src/lib/utils/html.ts` | `sanitizeHtml()` (DOMPurify), `sanitizeText()`, `escapeHtml()` |

---

## Content

| File | Purpose |
|------|---------|
| `src/lib/content/release-notes.ts` | Static release notes array (`ReleaseNote[]` — version, dated, highlights) — 5 entries (0.1.1 through 0.1.6) |
| `src/lib/matomo.ts` | Matomo analytics wrapper — `trackPageView()`, `trackFeatureEvent()`, `syncMatomoConsent()`, offline queue via `localStorage`, display mode dimension, online/offline listener |

---

## App Shell

| File | Purpose |
|------|---------|
| `src/app.html` | HTML template — manifest, favicon, Apple touch icon, theme color |
| `src/app.css` | Tailwind v4 + custom design tokens — color palette (15 primitives), font families (Atkinson Hyperlegible Next + IBM Plex Sans Condensed), border radius, shadows, base styles, component classes (buttons, cards, chips, fields) |
| `src/app.d.ts` | Type declarations — `__APP_VERSION__` public env var |

---

## Dependencies (from package.json)

| Category | Packages |
|----------|----------|
| **Framework** | `svelte`, `svelte-adapter-cloudflare-pages`, `@sveltejs/adapter-static`, `@sveltejs/kit` |
| **UI** | `tailwindcss`, `@fontsource/*` (Atkinson Hyperlegible Next, IBM Plex Sans, IBM Plex Sans Condensed) |
| **API** | `@the-events-calendar/client` (Tribes API client library), `dompurify` |
| **Date** | `date-fns` |
| **Map** | `leaflet` |

---

## Key Architectural Notes

- **No SSR on routes** — `prerender: true`, `ssr: false` on layout; all routes are client-rendered
- **Events fetched client-side** via `eventStore.loadEvents()` triggered on `onMount` in both `/` and `/calendar`
- **Client-side filtering** — all type/music/date filtering happens in the store (no server params for filter, only date range & categories)
- **Paginated fetch with caching** — `fetchAllEvents()` loops pages; `eventStore` caches by date filter; `activeRequestId` prevents race conditions
- **GDPR-first** — consent store gates Matomo tracking and OpenStreetMap tiles; essential always on
- **PWA** — `manifest.json`, Apple touch icon, `beforeinstallprompt` handler, `appinstalled` listener, `workbox` update checking via `$app/state.updated`
- **Leaflet maps** — lazy-imported (`import('leaflet')`) in map views, event detail, and legal pages; geo-based clustering on home map
- **Legal pages** — fetched from WP REST (`/wp-json/wp/v2/pages`), rendered with DOMPurify-sanitized HTML
- **Newsletter** — form POSTs to `/api/newsletter/subscribe` (external Sendy worker, not in-app)
