# Proposal: Improve PWA SEO

## Why

Google indexes `mobile.rhein-neckar-tango.de/event/{id}` URLs but shows generic titles ("RNT Kalender - Veranstaltung") because SPA routes ship without per-page metadata in the first HTML response. Crawlers and social unfurls need title, canonical, Open Graph, and Event JSON-LD before JavaScript runs.

## What Changes

- Shared `SeoMetadata` model and `SeoHead` component for all public routes
- Event SEO: unique titles, Tribe `json_ld` pass-through with mobile URL overlay, `noindex` for past events
- Cloudflare Worker HTML head injection for SPA document requests
- Extended sitemap: upcoming events, organizers, venues, DJs
- `/tanzraeume/{slug}` venue detail route with internal venue links from event pages
- Real HTTP 404 for missing events; `301 /calendar` → `/kalender`
- `noindex` for favoriten, offline, and error pages

## Out of Scope

- Domain cutover to www
- WordPress URL 301 migration
- Slug-based event URLs
- Full-body SSR via `adapter-cloudflare`

## Capabilities

### New Capabilities

- `pwa-seo`: Shared metadata model, worker head injection, sitemap, index control

### Modified Capabilities

- `event-detail`: Real 404, expired noindex, venue profile links
- `worker`: SEO injection, event detail cache, calendar redirect

## Impact

- Affected modules: `src/lib/seo/*`, `src/lib/components/SeoHead.svelte`, `worker.ts`, route pages
- Affected routes: all public pages; new `/tanzraeume/[slug]`
- Deployment: Worker + static build; verify with curl and Rich Results Test after deploy
