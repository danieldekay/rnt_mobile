# Proposal: CDN Caching for Cloudflare Worker Tribe API Proxy

## Why

The Cloudflare Worker proxy currently returns `cache-control: no-store` for every Tribe API
response, which means:

1. **No CDN-edge caching** — every browser request triggers a fresh upstream round-trip to
   the WordPress server, regardless of how recently the same URL was fetched.
2. **No browser caching** — navigating away and back to an entity page (DJs, Veranstalter,
   Tanzräume) re-fetches all paginated data from scratch.
3. **Multiplied WordPress load** — `fetchAllEvents` issues 3–34 sequential requests per page
   load; with 10 concurrent users, this becomes 30–340 WordPress API hits per page view.

Tango event data is not real-time. Events are created days or weeks in advance, and organiser /
venue records change rarely. A short TTL at the CDN edge (5 minutes for events, 30 minutes for
venues and organisers) absorbs the vast majority of repeat fetches without any meaningful
staleness risk.

## What Changes

### `worker.ts` — `proxyTribeRequest` + routing constants

Add Cloudflare `Cache API` (`caches.default`) support to the existing `proxyTribeRequest`
function:

1. **Cache TTL constants** (top of file, near `REQUEST_TIMEOUT_MS`):
   ```
   EVENTS_CACHE_TTL_SECONDS    = 300   (5 minutes)
   VENUES_CACHE_TTL_SECONDS    = 1800  (30 minutes)
   ORGANIZERS_CACHE_TTL_SECONDS = 1800 (30 minutes)
   ```

2. **`proxyTribeRequest` signature** — add optional `cacheTtlSeconds: number = 0` parameter.

3. **Cache-read path** — when `cacheTtlSeconds > 0`, attempt `caches.default.match(cacheKey)`
   before making an upstream fetch. Return the cached response immediately on hit.

4. **Cache key** — the canonical WordPress upstream URL (with forwarded query params), i.e.
   `new Request(targetUrl.toString())`. Using the upstream URL means all Cloudflare PoPs that
   receive the same logical query share the same cache entry.

5. **Cache-write path** — after a successful (`response.ok`) upstream fetch, call
   `cache.put(cacheKey, response.clone())`. Only cache 2xx responses; errors are never stored.

6. **`Cache-Control` response header** — replace `no-store` with:
   - `public, s-maxage=<ttl>, max-age=<browser-ttl>` when TTL > 0
   - `browser-ttl` = `min(ttl, 60)` so browsers also cache briefly, but the CDN edge holds
     the authoritative copy for the full TTL.
   - Keep `no-store` for 0-TTL paths (newsletter, auth endpoints) — those are unchanged.

7. **Routing call-sites** — pass TTL values per endpoint:
   ```
   EVENTS_LIST_PATH     → proxyTribeRequest(request, TRIBE_EVENTS_BASE_URL, EVENTS_CACHE_TTL_SECONDS)
   VENUES_LIST_PATH     → proxyTribeRequest(request, TRIBE_VENUES_BASE_URL, VENUES_CACHE_TTL_SECONDS)
   ORGANIZERS_LIST_PATH → proxyTribeRequest(request, TRIBE_ORGANIZERS_BASE_URL, ORGANIZERS_CACHE_TTL_SECONDS)
   BLOG_POSTS_PATH      → proxyTribeRequest(request, WP_POSTS_BASE_URL)          // no cache (unchanged)
   ANNOUNCEMENTS_PATH   → proxyTribeRequest(request, WP_ANNOUNCEMENTS_BASE_URL)  // no cache (unchanged)
   ```

## Capabilities

### Modified Capabilities

- `worker-proxy`: The Tribe API proxy now serves cached responses from the Cloudflare edge for
  events (5 min TTL), venues and organisers (30 min TTL). Cache is keyed on the full upstream
  URL including query string, so different paginated requests and date-range combinations are
  cached independently.

## Impact

- **Files changed**: `worker.ts` only — no SvelteKit, component, or store changes.
- **Deployment**: `worker.ts` is deployed via `wrangler deploy`; the static site build is
  unaffected.
- **User-visible effect**:
  - First page load per unique query is unchanged in speed (cache miss, full upstream fetch).
  - Repeat loads of the same page within the TTL window (e.g. refresh, back navigation,
    second user in the same PoP) are served in milliseconds from the edge.
  - Combined with the `fix-entity-page-load-timeout` 30-day window, subsequent paginated
    requests for the same `start_date`/`end_date`/`page` combination are cache hits after
    the first user fetches them.
- **Cache invalidation**: No explicit purge mechanism is added; the natural TTL expiry is
  sufficient for tango event data. If immediate invalidation is ever needed, Cloudflare's
  dashboard "Purge Cache" covers it.
- **Local dev**: `caches.default` is a no-op stub in `wrangler dev`; the code path falls
  through to the live upstream fetch, so local development is unaffected.
- **WordPress API load**: Peak load reduction is proportional to cache hit rate. With a 5-minute
  TTL and typical user session patterns (multiple users browsing the same pages within minutes),
  expect 70–90 % of event API requests to be served from cache.
- **Depends on**: Can be deployed independently of `fix-entity-page-load-timeout`, but the two
  changes are complementary — the timeout fix reduces pages-per-load, CDN caching reduces
  upstream hits per page across users.
