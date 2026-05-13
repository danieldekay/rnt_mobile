# Proposal: Fix Entity Page Load Timeout (DJs / Veranstalter / Tanzräume)

## Why

The `/djs`, `/djs/[slug]`, `/veranstalter`, `/veranstalter/[slug]`, and `/tanzraeume` routes
currently fail to load or take 60+ seconds because their `+page.ts` load functions call
`fetchAllEvents` with overly broad date windows.

The WordPress Tribe Events API now holds **1,699 published events**. At 50 events per page,
fetching a 3-year window requires **34 sequential API requests** through the Cloudflare Worker proxy,
and fetching a 6-month window requires **11 requests**. Because `fetchAllEvents` is purely
sequential (page 1 → page 2 → …), the total wall-clock time reaches 60–120 s — well beyond
any practical browser or UX threshold.

Measured page counts today:

| Window | Events | Pages | Approximate load |
|---|---|---|---|
| 30 days | 114 | 3 | ~6 s ✅ |
| 6 months | 530 | 11 | ~22 s ⚠️ |
| "all" (3 yrs) | 1,699 | 34 | ~68 s ❌ |

The three routes that use `'all'` with no date range are broken outright. The two using 6 months
are marginally functional today but will break as the event database grows.

## What Changes

Narrow the default date window to **today → today + 30 days** on all five affected page loaders.
The 30-day window requires only 3 paginated requests and loads in ~6 s regardless of how large
the historical event archive grows.

### `src/routes/tanzraeume/+page.ts`

- Replace `fetchAllEvents([], null, 'all', fetch)` (no date range → 3-year window)
  with an explicit `{ start, end }` date range of today + 30 days.

### `src/routes/djs/+page.ts`

- Replace the 6-month `end` date (`end.setMonth(end.getMonth() + 6)`)
  with a 30-day `end` date (`end.setDate(end.getDate() + 30)`).

### `src/routes/djs/[slug]/+page.ts`

- Replace `fetchAllEvents([], null, 'all', fetch)` (no date range → 3-year window)
  with an explicit `{ start, end }` date range of today + 30 days.

### `src/routes/veranstalter/+page.ts`

- Replace the 6-month `end` date with a 30-day `end` date.

### `src/routes/veranstalter/[slug]/+page.ts`

- Replace `fetchAllEvents([], null, 'all', fetch)` (no date range → 3-year window)
  with an explicit `{ start, end }` date range of today + 30 days.

## Capabilities

### Modified Capabilities

- `entity-dj-list`: DJs list page loads within ~6 s by default (30-day window, 3 API pages).
- `entity-dj-detail`: DJ detail page loads within ~6 s by default.
- `entity-veranstalter-list`: Veranstalter list page loads within ~6 s by default.
- `entity-veranstalter-detail`: Veranstalter detail page loads within ~6 s by default.
- `entity-tanzraeume-list`: Tanzräume page loads within ~6 s by default.

## Impact

- **Files changed**: 5 `+page.ts` load files only — no component, store, or API module changes.
- **User-visible effect**: Entity pages that currently time out will start loading reliably.
  Entities with no events in the next 30 days will show `upcomingCount: 0` and appear
  at the bottom of sorted lists; the `countsByDateFilter` data already supports this via
  the `'all'` bucket which counts all events within the loaded window.
- **Date filter UI**: Existing `EntityDateFilter` filter chips (`next-7-days`, `current-month`,
  `next-3-months`) will reflect only the loaded 30-day window unless a follow-up change
  adds a "load wider range" control (tracked separately as `entity-date-range-expansion`).
- **Prerendering**: None of these routes are prerendered (`prerender = false`); no build change needed.
- **API / feed impact**: Reduces WordPress API load significantly — from 34 to 3 requests per
  page load for the `'all'`-window routes.
- **No dependency on CDN caching change** (`worker-cdn-cache`): this fix is safe to deploy
  independently and delivers the biggest reliability win on its own.
