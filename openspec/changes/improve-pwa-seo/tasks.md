# Tasks: Improve PWA SEO

## 1. SEO Model

- [x] 1.1 Add `SeoMetadata`, `renderHeadElements`, and `SeoHead.svelte`
- [x] 1.2 Add event, hub, organizer, venue, DJ, and WordPress mappers

## 2. Routes & Entities

- [x] 2.1 Wire `SeoHead` on all public routes; `noindex` favoriten/offline/error
- [x] 2.2 Event page: real 404, expired banner, Tribe `json_ld` overlay
- [x] 2.3 Add `/tanzraeume/[slug]`; link venue names from event sidebar/quick info

## 3. Worker & Discovery

- [x] 3.1 Worker head injection for SPA document requests
- [x] 3.2 Cache single-event API; `301 /calendar` → `/kalender`
- [x] 3.3 Extend sitemap; mobile share URLs for events

## 4. Validation & Docs

- [x] 4.1 Unit tests for event SEO, sitemap, WordPress mapper
- [x] 4.2 `wiki/concepts/seo.md`, architecture update, OpenSpec change
- [x] 4.3 Run `npm run check` and `npm run build`
