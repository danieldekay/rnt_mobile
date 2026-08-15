---
type: Concept
title: SEO Foundations
description: Crawlable metadata, JSON-LD, sitemap, and index control for mobile.rhein-neckar-tango.de without domain migration.
tags: [seo, pwa, json-ld, sitemap, cloudflare-worker]
status: stable
---

# SEO Foundations

The RNT PWA stays on `mobile.rhein-neckar-tango.de` with stable numeric `/event/{id}` URLs. SEO work focuses on **first-response HTML metadata** for crawlers and social unfurls, not WordPress URL migration.

## Shared model

`SeoMetadata` in `src/lib/seo/metadata.ts` drives every public route:

- `title`, `description`, `canonical`, `robots`
- optional `image`, `jsonLd`

`SeoHead.svelte` renders client-side head tags. The Cloudflare Worker injects the same fields into the initial HTML for SPA routes.

## Event pages

- Title: `{title} – {d. MMMM yyyy} | Rhein-Neckar-Tango`
- Canonical: `https://mobile.rhein-neckar-tango.de/event/{id}`
- JSON-LD: pass through Tribe `json_ld` from `GET /api/events/{id}`; overlay `url` / `@id` to the mobile permalink; refine `@type` to `DanceEvent` or `EducationEvent` when applicable
- Past events: `noindex, follow`, omitted from sitemap
- Missing events: HTTP 404 with `noindex`

## Worker head injection

`worker.ts` uses `HTMLRewriter` via `injectHeadIntoHtml()` for document requests on SPA routes. Blog and announcement detail pages are skipped (they prerender with Yoast metadata).

Hub paths, `/event/{id}`, `/veranstalter/{slug}`, `/tanzraeume/{slug}`, and `/djs/{slug}` resolve SEO through `resolveSeoForPath()`.

## Discovery

- `generateSitemapXml()` in `src/lib/seo/sitemap.ts` — static hubs, blog/announcements, upcoming events, organizers, venues, DJs
- `static/robots.txt` points at `/sitemap.xml`
- `noindex`: `/favoriten`, `/offline`, expired events, 404
- `301 /calendar` → `/kalender`

## Entity linking

- Venue names on event pages link to `/tanzraeume/{slug}`
- Organizer and DJ profile links unchanged
- Share URLs use mobile `/event/{id}`

## Verification

```bash
npm run test:run
npm run check
npm run build
```

After deploy:

- `curl -s https://mobile.rhein-neckar-tango.de/event/{id} | rg '<title>|canonical|application/ld\\+json'`
- [Google Rich Results Test](https://search.google.com/test/rich-results) on an upcoming milonga
