---
type: Architecture
title: System Architecture
description: High-level structural decisions for the RNT Mobile PWA — SvelteKit 5 static adapter, hybrid rendering, Cloudflare Worker deployment.
tags: [architecture, sveltekit, cloudflare, static-adapter]
sources:
  - id: readme
    resource: /sources/README.md
    title: RNT Mobile README
  - id: inventory
    resource: /sources/INVENTORY.md
    title: RNT Mobile Project Inventory
  - id: deploy
    resource: /sources/DEPLOY.md
    title: Deployment Guide
  - id: agents
    resource: /sources/AGENTS.md
    title: AGENTS.md
generated: { by: agent/copilot, at: 2026-07-25T21:10:00Z }
status: stable
---

# System Architecture

RNT Mobile is a **SvelteKit 5 + Svelte 5 static PWA** for displaying Rhein-Neckar-Tango events. It fetches events from a WordPress REST API and deploys to Cloudflare Worker Assets.

## Key Structural Decisions

### Static Adapter + Hybrid Rendering

The app uses `@sveltejs/adapter-static` with prerendering enabled. Most interactive routes are **client-rendered** (`ssr: false` on layout). Blog, announcements, and legal pages prerender with `ssr: true`. This means:

- No Node runtime at deploy time
- Event list and detail data loads in the browser via stores and route loaders
- The build output is static files served by a Cloudflare Worker
- The Worker injects SEO metadata into the first HTML for SPA routes (see `wiki/concepts/seo.md`)

### Rendering Modes

The layout sets `prerender: true, ssr: false` for the main app shell. Routes `/`, `/kalender`, `/event/[id]`, and entity pages render client-side after load. Blog and announcement articles prerender with Yoast metadata. The Worker supplements SPA routes with title, canonical, Open Graph, and JSON-LD in the initial response.

### Cloudflare Worker Assets

The build output (`build/`) is served via a Cloudflare Worker (`worker.ts`) using the `[assets]` config with `not_found_handling: "single-page-application"`. This gives SPA routing for free. [^deploy]

### Worker Entrypoint

`worker.ts` handles:
- Static asset serving from `build/`
- `/api/newsletter/subscribe` → Sendy API proxy
- `/api/links` → Link management
- `/api/wp-auth-status` → WordPress auth status proxy
- Matomo analytics proxy (if configured)

### Dev Proxy

`vite.config.ts` defines `DEV_API_TARGETS` — a dev-server middleware that proxies WordPress API calls to avoid CORS during development. Targets include:

| Path | Target |
|------|--------|
| `/api/events` | `tribe/events/v1/events` |
| `/api/venues` | `tribe/events/v1/venues` |
| `/api/organizers` | `tribe/events/v1/organizers` |
| `/api/posts` | `wp/v2/posts` |
| `/api/announcements` | `wp/v2/ankuendigung` |
| `/api/dj-cpt` | `wp/v2/dj` |
| `/api/links` | `localhost:8787/api/links` |

### Module Organization

```
src/
  app.html              ← HTML template
  app.css               ← Tailwind v4 + design tokens
  app.d.ts              ← Type declarations
  lib/
    api/                ← API clients (tribe, legal)
    components/         ← Svelte components
    stores/             ← Svelte 5 rune-based stores
    utils/              ← Utility functions
    content/            ← Static content (release notes)
    matomo.ts           ← Analytics wrapper
    seo/                ← Sitemap, SEO utilities
    types.ts            ← TypeScript interfaces
    constants.ts        ← Filter slugs, class maps
  routes/               ← SvelteKit routes
  service-worker.ts     ← PWA service worker
```

### Data Flow

1. User opens app → `eventStore.loadEvents()` triggered in `onMount`
2. `fetchAllEvents()` loops paginated WordPress REST API
3. Events cached in `eventStore` by date filter
4. Client-side filtering (type, music, date) happens in the store
5. Components reactively update via Svelte 5 runes

### GDPR-First Design

The `consentStore` gates:
- **Matomo analytics** — only tracked after consent
- **OpenStreetMap tiles** — only loaded after consent
- Essential functionality always available

### PWA Architecture

- `manifest.json` for installability
- `beforeinstallprompt` handler for custom install flow
- `appinstalled` listener for analytics
- SvelteKit `updated` state for update checking
- Service worker for offline support

## Cross-References

- [Event Lifecycle](/concepts/event-lifecycle.md) — how events are fetched and rendered
- [API Layer](/concepts/api-layer.md) — WordPress REST API integration
- [Component System](/concepts/component-system.md) — UI component architecture
- [Deployment Pipeline](/concepts/deployment-pipeline.md) — CI/CD and Cloudflare setup
- [PWA System](/concepts/pwa-system.md) — installability and offline support
- [Analytics](/concepts/analytics.md) — Matomo tracking implementation
