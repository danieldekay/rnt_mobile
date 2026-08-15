# RNT Mobile — Codebase Diagnosis Report

**Date**: 2026-05-14  
**Scope**: SvelteKit 5 PWA, Cloudflare Pages/Workers deployment  
**Severity legend**: 🔴 Critical 🟠 High 🟡 Medium 🟢 Low

---

## 1. SECURITY

### 🔴 CRITICAL-1: WordPress Auth Status Exposes User Session State

**Files**: `worker.ts` lines 42–84, `vite.config.ts` lines 38–62  
**Issue**: `/api/wp-auth-status` probes the WordPress admin panel on behalf of the client. Any visitor can determine whether a _specific user_ is logged into WordPress admin by sending that user's session cookie. This is a privacy leak — non-admin users' login state is observable.  
**Fix**: Return a generic "auth endpoint available" response without probing individual sessions. Or restrict this endpoint to admin-only access.

### 🔴 CRITICAL-2: No Content-Security-Policy (CSP) Headers

**Files**: `worker.ts` (every response), `vite.config.ts` (no headers plugin)  
**Issue**: No `Content-Security-Policy` header is set on any response. The app loads external scripts (Matomo), images, and fonts without a CSP. This leaves the app vulnerable to XSS via injected scripts.  
**Fix**: Add a CSP header in the worker's response builder and/or a Vite plugin. At minimum: `default-src 'self'; script-src 'self' <matomo-url>; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' <font-url>; connect-src 'self' <matomo-url> <wordpress-url>;`

### 🟠 HIGH-1: Incomplete Origin Check on Newsletter Endpoints

**Files**: `worker.ts` lines 342–344, 395–397, 449–451  
**Issue**: The origin check `if (origin && origin !== requestUrl.origin)` only rejects if the `Origin` header is present and differs from the request URL. An attacker can simply omit the `Origin` header or not set it, bypassing the check entirely.  
**Fix**: If the endpoint should be internal-only, use a shared secret (e.g., a header like `x-internal-key`) or remove the endpoint from public exposure. If it should accept any origin, remove the check and rely on CSRF tokens instead.

### 🟠 HIGH-2: No CSRF Protection on Newsletter Endpoints

**Files**: `worker.ts` `handleNewsletterSubscribe`, `handleNewsletterUnsubscribe`  
**Issue**: Newsletter subscribe/unsubscribe endpoints accept POST requests from any origin (when Origin header is absent). There is no CSRF token validation.  
**Fix**: Add SameSite cookie handling, or require a custom header (e.g., `x-csrf-token`) that the browser cannot set cross-origin.

### 🟡 MEDIUM-1: WordPress API Keys/Secrets in `wrangler.toml`

**File**: `wrangler.toml` lines 9–10  
**Issue**: `SENDY_LIST_ID` is stored in plain text in version control. While not a true secret, it exposes internal infrastructure details.  
**Fix**: Move `SENDY_LIST_ID` to a Cloudflare Worker secret via `wrangler secret put SENDY_LIST_ID`.

### 🟢 LOW-1: `console.log` Statements in Production Code

**Files**: `links.ts` lines 33–44 (multiple `console.log` calls)  
**Issue**: Debug logging is left in the RSS parser, potentially exposing internal data in production.  
**Fix**: Replace with a proper logging framework or remove console statements.

---

## 2. PERFORMANCE

### 🟠 HIGH-1: Monolithic Store — Inline Filtering on Every Change

**File**: `src/lib/stores/events.svelte.ts` lines 72–89 (`withFilteredEvents`)  
**Issue**: `withFilteredEvents` iterates **all** `allEvents` on every filter/search change, filtering by type, music, and search query. For large event sets (hundreds of events), this runs synchronously on every keystroke and filter toggle.  
**Fix**: Debounce `setSearchQuery` by 200–300ms. Pre-compute category slug arrays on `fetchAllEvents`. Consider indexing by type/music for O(1) lookup.

### 🟠 HIGH-2: Calendar Component Rebuilds on Every Render

**File**: `src/lib/components/Calendar.svelte` lines 17–33 (`getMonthData`), lines 35–47 (`buildEventMap`)  
**Issue**: `getMonthData` creates a new `Date` object for every day, and `buildEventMap` rebuilds the entire event→date Map on every render via `$derived.by`. While `$derived` caches, the Map creation allocates many Date objects.  
**Fix**: Memoize `getMonthData` result by month key. Build the event map once in the parent store, not on every calendar render.

### 🟠 HIGH-3: Leaflet Loaded on Every Visit

**File**: `src/routes/+page.svelte` (dynamic import of Leaflet)  
**Issue**: Leaflet is dynamically imported on every page visit rather than being cached or preloaded. For a map-heavy page, this adds ~400KB on each navigation.  
**Fix**: Use a module preload hint or cache the module in `sessionStorage`/`localStorage`. Alternatively, make it a top-level dynamic import that the browser caches.

### 🟡 MEDIUM-1: No Bundle Size Analysis

**Files**: No `rollup-plugin-visualizer` or similar configured  
**Issue**: No build-time bundle size reporting. Dependencies like `leaflet` (~400KB), `dompurify`, `date-fns`, `he` add significant payload.  
**Fix**: Add `@rollup/plugin-visualizer` to `vite.config.ts` to track bundle sizes across iterations.

### 🟡 MEDIUM-2: Excessive Dependencies

**File**: `package.json` deps  
**Issue**: `leaflet` (400KB), `@melt-ui/svelte` (UI primitives), `date-fns` (full), `dompurify` (200KB), `he` (HTML entities), 3 font packages (Atkinson, IBM Plex Sans, IBM Plex Sans Condensed). These 6 dependencies add ~1.5–2MB to the initial bundle.  
**Fix**: Audit usage of each. `date-fns` can be tree-shaken to v3 with `date-fns/locale`. Consider `he` replacement with native DOMPurify. Combine font packages into one where possible.

---

## 3. ACCESSIBILITY

### 🟠 HIGH-1: No Skip Navigation Links

**File**: `src/routes/+layout.svelte`, `src/app.html`  
**Issue**: No skip-to-content link. Keyboard-only users must tab through every navigation item to reach main content.  
**Fix**: Add a `<a href="#main-content" class="sr-only focus:not-sr-only">Zum Inhalt springen</a>` as the first element in `+layout.svelte`.

### 🟡 MEDIUM-1: Calendar Date Buttons Missing Keyboard Navigation for Event Details

**File**: `src/lib/components/Calendar.svelte` lines 78–103  
**Issue**: Calendar date buttons correctly use `aria-pressed` and `aria-current`, but clicking a date only selects it — there's no keyboard-accessible way to view event details from the calendar view. The event count badges have no interactive affordance.  
**Fix**: Make date buttons with events open a detail view (modal or slide-over) on both click and Enter/Space key.

### 🟡 MEDIUM-2: Map Markers Lack Accessibility Labels

**File**: `src/routes/+page.svelte` (map rendering, `createSingleMarkerIcon`, `renderMarkers`)  
**Issue**: Leaflet map markers are images without ARIA labels. Screen reader users cannot identify events on the map.  
**Fix**: Add `title` attributes to marker SVGs. Add a list of events alongside the map with screen-reader-only labels.

### 🟡 MEDIUM-3: No Focus Management in PWA Install/Update Modals

**File**: `src/lib/components/PwaInstallModal.svelte` (implied), `src/lib/stores/pwa-install.svelte.ts`  
**Issue**: When `modalOpen` is set to `true`, focus is not moved into the modal. There's no focus trap or `aria-modal` pattern.  
**Fix**: Implement focus trapping when `modalOpen` is true, set `aria-modal="true"`, and move focus to the first interactive element in the modal.

### 🟢 LOW-1: Color Contrast on Calendar Past Dates

**File**: `src/lib/components/Calendar.svelte` line 85 (`opacity-50` on past dates)  
**Issue**: Past date text at 50% opacity against the background may fail WCAG AA contrast ratios.  
**Fix**: Test contrast with actual design tokens. If below 4.5:1, increase text color weight rather than using opacity alone.

---

## 4. ARCHITECTURE

### 🟠 HIGH-1: Monolithic Cloudflare Worker (926 lines)

**File**: `worker.ts` (926 lines)  
**Issue**: The worker handles WordPress auth status, blog posts, announcements, DJ CPT, links RSS, events, event details, venues, organizers, newsletter subscribe/unsubscribe/status, and asset serving — all in one file with no routing abstraction.  
**Fix**: Split into separate handler modules: `auth-status.ts`, `newsletter.ts`, `api-proxy.ts`, `rss.ts`, `assets.ts`. Export a single handler that composes them.

### 🟠 HIGH-2: Monolithic Matomo Module (535 lines)

**File**: `src/lib/matomo.ts` (535 lines)  
**Issue**: Combines analytics configuration, page view tracking, error tracking, performance monitoring, offline event queuing, online/offline detection, and display mode tracking.  
**Fix**: Split into: `matomo-config.ts` (initialization), `matomo-tracking.ts` (page views, events), `matomo-error.ts` (error/performance tracking), `matomo-offline.ts` (pending events queue).

### 🟡 MEDIUM-1: Events Store Duplicates Filtering Logic

**Files**: `src/lib/stores/events.svelte.ts` `withFilteredEvents` (lines 72–89), `src/lib/api/tribe.ts` `fetchEvents` (filters passed to API)  
**Issue**: Filtering is done both client-side (in the store) and server-side (in the API fetcher). The API already supports type/music/date filtering, but the store always re-filters the full `allEvents` list.  
**Fix**: Rely on server-side filtering from `fetchEvents`. Use client-side filtering only for search queries.

### 🟡 MEDIUM-2: No API Rate Limiting

**File**: `worker.ts` (all proxy endpoints)  
**Issue**: No rate limiting on any API endpoint. The worker can be easily abused to scan the WordPress site with high-frequency requests.  
**Fix**: Add a simple rate limiter (e.g., IP-based token bucket) to the worker with a generous limit (e.g., 100 req/min per IP).

### 🟡 MEDIUM-3: `+layout.ts` Forces Client-Only Rendering

**File**: `src/routes/+layout.ts` lines 1–2  
**Issue**: `ssr: false` disables all server-side rendering. Every route is a client-side app. This means no SEO benefit from server rendering, slower initial paint, and no progressive enhancement path.  
**Fix**: Enable SSR for content pages (blog, events, venues, organizers) with `prerender` or `ssr: true`. Keep client-only rendering only for interactive pages (map view, calendar).

---

## 5. PWA BEST PRACTICES

### 🟠 HIGH-1: Missing `display_override` and `screenshots` in `manifest.json`

**File**: `static/manifest.json` (25 lines)  
**Issue**: The manifest lacks `display_override` (e.g., `["standalone", "fullscreen"]`) which is required by modern install prompts. No `screenshots` array for install cards. Missing `prefer_related_applications`.  
**Fix**: Add `"display_override": ["standalone", "fullscreen"]`, `"screenshots": [...]`, and `"prefer_related_applications": false`.

### 🟡 MEDIUM-1: No Maskable Icon

**File**: `static/manifest.json`  
**Issue**: No `maskable` icon variant defined. Modern Android Chrome requires a maskable icon for adaptive icons.  
**Fix**: Add a 512×512 maskable icon to the icons array with `"purpose": "maskable"`.

### 🟡 MEDIUM-2: Missing PWA Meta Tags in `app.html`

**File**: `src/app.html` (17 lines)  
**Issue**: No `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-status-bar-style">`, or `<meta name="mobile-web-app-capable">`.  
**Fix**: Add iOS PWA meta tags for proper standalone display on iOS.

### 🟡 MEDIUM-3: No Offline Fallback Page

**File**: `svelte.config.js` fallback: `'index.html'`  
**Issue**: When offline, all routes fall back to `index.html`. There's no dedicated offline page that informs the user.  
**Fix**: Create an `offline.html` that explains the app is offline and suggests reconnecting. Configure the worker to serve it for offline routes.

### 🟢 LOW-1: Service Worker Caching Is Proxy-Based Only

**File**: `worker.ts` `proxyTribeRequest` (lines 180–210)  
**Issue**: Caching is handled exclusively at the Cloudflare Worker level with `s-maxage` and `max-age` headers. No browser Service Worker for caching static assets (HTML, CSS, JS).  
**Fix**: Register a Service Worker that caches the app shell (HTML/CSS/JS) with a stale-while-revalidate strategy, complementing the Worker-level API caching.

---

## 6. CODE QUALITY & ANTI-PATTERNS

### 🟠 HIGH-1: Missing Error Boundaries

**Files**: All route files — no `<ErrorBoundary>` in SvelteKit terms  
**Issue**: `+error.svelte` handles HTTP errors (4xx/5xx), but there's no runtime error boundary for component crashes. A JavaScript error in any component will show the SvelteKit generic error page instead of a graceful fallback.  
**Fix**: Add SvelteKit error boundaries for key route groups (event detail, calendar view).

### 🟠 HIGH-2: `data-validation.ts` (474 lines) — Over-Engineered

**File**: `src/lib/utils/data-validation.ts` (474 lines)  
**Issue**: This module provides extensive validation and sanitization for organizers and venues, but the validation results (`ValidationResult` with `errors[]`, `warnings[]`, `sanitized`) are never consumed by any caller. The exported functions `validateOrganizer`, `validateVenue`, `sanitizeAndValidateOrganizer`, `sanitizeAndValidateVenue`, `batchValidateOrganizers`, `batchValidateVenues` appear to be dead code.  
**Fix**: Either wire this into the API layer (e.g., `handleValidationError` in `error-handling.ts`), or remove it to reduce bundle size.

### 🟡 MEDIUM-1: Hardcoded WordPress Origin Throughout Codebase

**Files**: `worker.ts` (every endpoint), `vite.config.ts` (every URL), `src/lib/api/tribe.ts` (every API call)  
**Issue**: `https://www.rhein-neckar-tango.de` is hardcoded in ~15 files. Changing the WordPress domain requires editing every file.  
**Fix**: Define `WORDPRESS_ORIGIN` as an environment variable, read from `process.env` in the worker and `$env/static/public` in the client.

### 🟡 MEDIUM-2: No Type Safety for API Responses

**File**: `src/lib/api/tribe.ts` (many `any` casts)  
**Issue**: Several places cast API responses to `any` before extracting fields (`extractTagsFromRawData`, `extractFeaturedImage`, etc.). This bypasses TypeScript and risks runtime errors if the WordPress API changes.  
**Fix**: Define Zod or manual type guards for each API response shape.

### 🟡 MEDIUM-3: No Tests for Core Business Logic

**Files**: Only `tribe.test.ts`, `matomo.test.ts`, `html.test.ts`, `Avatar.test.svelte`, `Badge.test.svelte`, `Button.test.svelte`, `Card.test.svelte`, `Divider.test.svelte`, `Heading.test.svelte`, `Text.test.svelte` exist (12 test files)  
**Issue**: The stores (`events.svelte.ts`, `consent.svelte.ts`, `pwa-install.svelte.ts`, `pwa-update.svelte.ts`), the worker handlers, and the API layer have no tests. This is where bugs are most likely.  
**Fix**: Add unit tests for `events.svelte.ts` filtering logic, `pwa-install.svelte.ts` platform detection, and `worker.ts` handler routing.

---

## 7. SUMMARY BY SEVERITY

| Severity    | Count | Key Issues                                                                                                                                                                           |
| ----------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 🔴 Critical | 2     | WordPress auth probe, no CSP                                                                                                                                                         |
| 🟠 High     | 8     | Origin check bypass, no CSRF, monolithic worker/matomo, no skip nav, no SSR, missing manifest fields, no error boundaries, dead validation code                                      |
| 🟡 Medium   | 12    | Rate limiting, store duplication, excessive deps, no icons, no offline page, no WCAG contrast, no focus trap, hardcoded origins, no API types, no tests, map a11y, calendar keyboard |
| 🟢 Low      | 2     | Console logs in prod, full date-fns bundle                                                                                                                                           |

## 8. RECOMMENDED FIX PRIORITY

1. **Add CSP headers** to worker responses (solves 🔴-2)
2. **Remove/Restrict `/api/wp-auth-status`** (solves 🔴-1)
3. **Split `worker.ts`** into handler modules (solves 🟠-1)
4. **Split `matomo.ts`** into focused modules (solves 🟠-2)
5. **Add skip navigation link** to `+layout.svelte` (solves 🟠-1 a11y)
6. **Add debounce to `setSearchQuery`** in `events.svelte.ts` (solves 🟠-1 perf)
7. **Update `manifest.json`** with `display_override` and maskable icon (solves 🟠-1 PWA)
8. **Wire up or remove `data-validation.ts`** (solves 🟠-2 quality)
