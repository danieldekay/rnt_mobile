# Architecture & Performance Tasks Results

## Tasks Completed This Session

### Task 2.2: Debounced Search (events.svelte.ts)
- Added `SEARCH_DEBOUNCE_MS = 250` constant
- Added `searchDebounceTimer` state
- Modified `setSearchQuery()` to debounce 250ms before applying filters
- Prevents excessive re-renders during rapid typing

### Task 4.2: Split Matomo Implementation (src/lib/matomo/)
- Created `src/lib/matomo/config.ts` — `normalizeBaseUrl()`, `getConfig()`
- Created `src/lib/matomo/tracking.ts` — `syncMatomoConsent()`, `trackPageView()`, `trackFeatureEvent()`, `matomoConfigured()`, `getMatomoDisplayMode()`, `cleanup()`
- Created `src/lib/matomo/errors.ts` — `trackError()`, `setupErrorTracking()`, `teardownErrorTracking()`
- Created `src/lib/matomo/performance.ts` — `setupPerformanceTracking()`, `trackPerformance()`, `sendPerformanceMetrics()`, `teardownPerformanceTracking()`
- Updated `src/lib/matomo.ts` to re-export from split modules (backward-compatible)
- All existing imports from `$lib/matomo` continue to work

### Task 4.3: Server-Client Filtering Boundaries (events.svelte.ts)
- Removed `eventMatchesTypes()` and `eventMatchesMusic()` from store (API handles this)
- Updated `applyFilters()` to only perform text search filtering
- API `fetchEvents()` already sends `categories` param for type + music filtering
- Reduces redundant client-side filtering from ~600 events

### Task 4.4: IP-Based Rate Limiting (worker.ts)
- Added constants: `RATE_LIMIT_MAX = 100`, `RATE_LIMIT_WINDOW_MS = 60s`, `RATE_LIMIT_CACHE_TTL = 65s`
- Added `getClientIp()` — reads `x-forwarded-for`, `cf-connecting-ip`, or `x-real-ip`
- Added `checkRateLimit()` — per-IP counter using Cloudflare Cache API
- Applied rate limit check at top of `fetch()` handler for all API routes
- Returns 429 with JSON error when limit exceeded
- Graceful degradation: skips rate limiting when IP is unresolvable

### Task 4.5: Route-Appropriate SSR/Prerender (svelte.config.js, route files)
- Updated `svelte.config.js`: changed `handleHttpError: 'ignore'` → `'warn'`
- Created `src/routes/+page.ts` with `{ prerender: false }` (home page)
- Created `src/routes/kalender/+page.ts` with `{ prerender: false }` (calendar)
- All dynamic routes already had `{ prerender: false }` (event detail, djs, veranstalter, blog, ankuendigungen)
- Static pages (legal, links, release notes) remain prerendered by default

## Validation

- `npm run check`: 0 errors, 0 warnings
- `npm run build`: Success — 3.42 MB output to `build/` directory
- Cloudflare Pages adapter-static compatible

## Files Changed

| File | Change |
|------|--------|
| `src/lib/stores/events.svelte.ts` | Task 2.2 (debounced search), Task 4.3 (removed duplicate filtering) |
| `src/lib/matomo.ts` | Task 4.2 (re-export layer) |
| `src/lib/matomo/config.ts` | Task 4.2 (new module) |
| `src/lib/matomo/tracking.ts` | Task 4.2 (new module) |
| `src/lib/matomo/errors.ts` | Task 4.2 (new module) |
| `src/lib/matomo/performance.ts` | Task 4.2 (new module) |
| `src/lib/api/events.ts` | Minor refactor (no functional change) |
| `svelte.config.js` | Task 4.5 (handleHttpError: 'warn') |
| `src/routes/+page.ts` | Task 4.5 (new SSR route) |
| `src/routes/kalender/+page.ts` | Task 4.5 (new SSR route) |
| `worker.ts` | Task 4.4 (rate limiting) |
| `openspec/changes/address-diagnosis-findings/tasks.md` | Marked 2.2, 4.2, 4.3, 4.4, 4.5 complete |

## Remaining Work
- Tasks 2.4, 2.5 (calendar memoization): The Calendar component already uses `$derived` and `$derived.by` for month grid and event maps. These are already memoized per month change.
- Tasks 5.5 (offline fallback page): Not implemented (requires new route + service worker config)
- Tasks 6.1 (error boundaries): Not implemented (requires route-level error handling)
- Tasks 6.2 (dead code): Not implemented (requires investigation)
- Tasks 7.1-7.6 (validation): Build/check pass, but full validation suite pending
