# Tasks: Matomo Enhanced Error Tracking + Analytics

## Task Group: Error Tracking Module

### Task 1.1: Create error tracking module

**File:** `src/lib/matomo/errors.ts`
**Dependencies:** `src/lib/matomo.ts` (existing trackEvent)

Create `src/lib/matomo/errors.ts` — the error tracking module that captures uncaught errors, fetch failures, and component errors for Matomo analytics.

**Implementation:**

1. `trackError(error: Error, context?: string): void` — send to Matomo with metadata
2. `setupErrorTracking(): void` — register global error/panic listeners
3. `trackFetchError(url: string, status: number): void` — API fetch failures
4. `trackComponentError(component: string, error: Error): void` — component-level failures
5. `ERROR_SESSION_LIMIT = 10` — max errors per session
6. Error counter state — resets on session restart
7. Error messages sanitized — no PII, no stack traces in production

**Acceptance:**

- [ ] `errors.ts` module compiles without TypeScript errors
- [ ] `trackError()` constructs proper Matomo dataLayer push
- [ ] `setupErrorTracking()` registers unhandledrejection and error listeners
- [ ] Fetch errors include URL path and HTTP status
- [ ] Component errors include component name and error message
- [ ] Error counter does not exceed 10 per session
- [ ] All exports are typed and exported

---

### Task 1.2: Integrate error tracking into +layout.svelte

**File:** `src/routes/+layout.svelte`
**Dependencies:** `src/lib/matomo/errors.ts`

Wire up error tracking initialization in the root layout so all pages inherit error capture.

**Implementation:**

1. Import `setupErrorTracking` and `teardownErrorTracking` from `errors.ts`
2. Call `setupErrorTracking()` on app mount inside `onMount()`
3. Call `teardownErrorTracking()` on unmount inside `onMount` cleanup
4. Gate error tracking behind consent check `consentStore.hasConsent('analytics')`
5. If consent revoked → call teardown to stop tracking

**Acceptance:**

- [ ] Error tracking activates when analytics consent is given
- [ ] Error tracking deactivates when consent is revoked
- [ ] `setupErrorTracking()` called once on mount
- [ ] `teardownErrorTracking()` called on unmount
- [ ] No console errors on mount/unmount cycles

---

### Task 1.3: Add error tracking to error page

**File:** `src/routes/+error.svelte` (if exists)
**Dependencies:** `src/lib/matomo/errors.ts`

Track errors that appear on the error page itself.

**Implementation:**

1. On error page load, call `trackError(error, 'error_page')`
2. Include request URL path in error context
3. Include error type (fetch, render, unknown) as context

**Acceptance:**

- [ ] Error page renders Matomo error event
- [ ] Error includes URL path for debugging
- [ ] No crash when error page itself has errors

---

## Task Group: Enhanced Analytics Module

### Task 2.1: Create event tracking module

**File:** `src/lib/matomo/analytics.ts`
**Dependencies:** `src/lib/matomo.ts` (existing trackEvent)

Create `src/lib/matomo/analytics.ts` — event and route tracking for Matomo.

**Implementation:**

1. `trackEvent(category: string, action: string, label?: string, value?: number): void`
2. `trackRouteChange(from: string, to: string): void` — route transitions
3. `trackRouteView(route: string, title: string): void` — page views with consent
4. `trackFilterToggle(filter: string, active: boolean): void` — filter toggles
5. `trackShareAction(eventId: number): void` — share button
6. `trackEventDetailView(eventId: number): void` — detail views
7. `trackDateFilterToggle(filter: string, active: boolean): void` — date filters

**Acceptance:**

- [ ] `analytics.ts` compiles without errors
- [ ] All tracking functions accept correct types
- [ ] `trackFilterToggle()` constructs valid Matomo event dataLayer push
- [ ] `trackShareAction()` sends eventId as label
- [ ] Route change includes both from and to paths

---

### Task 2.2: Wire analytics to home page (+page.svelte)

**File:** `src/routes/+page.svelte`
**Dependencies:** `src/lib/matomo/analytics.ts`

Add event tracking to user interactions on the home page.

**Implementation:**

1. Track filter toggle (Milonga, Practica, etc.) with `trackFilterToggle(filter, active)`
2. Track date filter toggle (Heute, Woche, Monat) with `trackDateFilterToggle(filter, active)`
3. Track image toggle with `trackEvent('home', 'image_toggle', value ? 'show' : 'hide')`
4. Track map toggle with `trackEvent('home', 'map_toggle', value ? 'show' : 'hide')`

**Acceptance:**

- [ ] All filter toggles tracked when activated/deactivated
- [ ] Date filter changes tracked separately from type filters
- [ ] Image and map toggles sent as separate events
- [ ] Events only sent when analytics consent is given
- [ ] No duplicate events on rapid toggles (debounced <300ms)

---

### Task 2.3: Wire analytics to event detail page

**File:** `src/routes/events/[id]/+page.svelte`
**Dependencies:** `src/lib/matomo/analytics.ts`

Add event tracking to user actions on event detail pages.

**Implementation:**

1. Track share button click with `trackShareAction(eventId)`
2. Track save/download button click with `trackEvent('events', 'save', eventId)`
3. Track calendar save click with `trackEvent('events', 'calendar_save', eventId)`
4. Track in-map marker click with `trackEvent('events', 'map_marker_click', eventId)`
5. Track back button with `trackEvent('events', 'back_click')`
6. Track page view on mount with `trackRouteView(route, title)`

**Acceptance:**

- [ ] Share actions tracked when clicked
- [ ] Save actions tracked when clicked
- [ ] Calendar save tracked when clicked
- [ ] In-map marker clicks tracked
- [ ] Event detail page views tracked on mount
- [ ] Back button tracked when clicked

---

## Task Group: Display Mode Detection

### Task 3.0: Create display mode module

**File:** `src/lib/matomo/display-mode.ts`
**Dependencies:** None (uses browser `window.matchMedia`)

Create `src/lib/matomo/display-mode.ts` — PWA display mode detection and tracking.

**Implementation:**

1. `getDisplayMode(): 'standalone' | 'browser' | 'fullscreen' | 'minimal-ui'` — read from `matchMedia('(display-mode: standalone)')`
2. `setupDisplayModeTracking(): void` — register listener for mode changes
3. Track mode changes to Matomo with `trackEvent('display', 'mode_change', mode)`
4. `currentMode` state variable — stores detected mode
5. `trackDisplayChange(mode: string): void` — sends to Matomo

**Acceptance:**

- [ ] `getDisplayMode()` returns correct mode for current viewport
- [ ] Mode changes are detected and tracked in Matomo
- [ ] Listener is properly registered on mount
- [ ] All enum values handled: standalone, browser, fullscreen, minimal-ui

---

### Task 3.1: Wire display mode in layout

**File:** `src/routes/+layout.svelte`
**Dependencies:** `src/lib/matomo/display-mode.ts`

Initialize display mode tracking in root layout and set initial tracking.

**Implementation:**

1. Import `setupDisplayModeTracking` from `display-mode.ts`
2. Call on mount: `setupDisplayModeTracking()`
3. Gate behind consent: `if (consentStore.hasConsent('analytics'))`
4. Send initial mode on every page load

**Acceptance:**

- [ ] Display mode detection runs on mount
- [ ] Mode changes tracked in Matomo
- [ ] Display mode tracking respects consent
- [ ] No errors on mount/unmount

---

## Task Group: Performance Tracking

### Task 4.0: Create performance tracking module

**File:** `src/lib/matomo/performance.ts`
**Dependencies:** `src/lib/matomo.ts` (trackEvent)

Create `src/lib/matomo/performance.ts` — LCP, FID, CLS metrics via PerformanceObserver.

**Implementation:**

1. `trackLcp(): void` — Largest Contentful Paint via `PerformanceObserver('largest-contentful-paint')`
2. `trackFid(): void` — First Input Delay via `PerformanceObserver('interaction')`
3. `trackCls(): void` — Cumulative Layout Shift via `PerformanceObserver('layout-shift')`
4. `trackAllPerformance(): void` — batch send LCP + FID + CLS combined
5. `setupPerformanceTracking(): void` — register observers on mount
6. `teardownPerformanceTracking(): void` — unregister observers on unmount

**Acceptance:**

- [ ] `trackLcp()` captures LCP value in milliseconds
- [ ] `trackFid()` captures FID value for first user interaction
- [ ] `trackCls()` captures layout shift score across page lifecycle
- [ ] `trackAllPerformance()` sends combined metrics in single Matomo event
- [ ] All observers are properly disconnected on teardown

---

### Task 4.1: Wire performance in layout

**File:** `src/routes/+layout.svelte`
**Dependencies:** `src/lib/matomo/performance.ts`

Initialize performance tracking in root layout.

**Implementation:**

1. Import `setupPerformanceTracking` and `teardownPerformanceTracking` from `performance.ts`
2. Call `setupPerformanceTracking()` on mount
3. Call `teardownPerformanceTracking()` on unmount (for SPA nav)
4. Gate behind consent check

**Acceptance:**

- [ ] Performance tracking initializes on mount
- [ ] LCP tracked on first paint
- [ ] FID tracked on first user interaction
- [ ] CLS tracked across navigations
- [ ] Tracking stops when consent revoked
- [ ] Observer teardown on unmount prevents memory leaks

---

## Task Group: Offline Queue Integration

### Task 5.0: Integrate tracking events with offline queue

**File:** `src/lib/matomo/offline.ts` (existing, modified)
**Dependencies:** `src/lib/matomo/errors.ts`, `src/lib/matomo/analytics.ts`

Update existing offline queue to include all new tracking event types.

**Implementation:**

1. Queue now accepts `matomo|error|...` prefixed events
2. Queue now accepts `matomo|analytics|...` prefixed events
3. Queue now accepts `matomo|display|...` prefixed events
4. Queue flushes all event types on reconnect
5. Queue cap at 50 events — drops oldest when full
6. Heartbeat includes error queue depth
7. All tracking calls gated by consent before queue write

**Acceptance:**

- [ ] Error events queued when offline
- [ ] Analytics events queued when offline
- [ ] Display mode events queued when offline
- [ ] All queued events flushed on reconnect
- [ ] Queue respects 50-event capacity limit
- [ ] Heartbeat includes queued error count
- [ ] No tracking events queued when consent is revoked

---

### Task 5.1: Add page view tracking to layout

**File:** `src/routes/+layout.svelte`
**Dependencies:** `src/lib/matomo/analytics.ts`

Track route changes as page views in Matomo.

**Implementation:**

1. On any route change, send `trackRouteView(urlPath, pageTitle)`
2. Include search params in URL
3. Gate behind analytics consent
4. Skip tracking on internal links if offline

**Acceptance:**

- [ ] `/` route tracked with `title: 'rnt_mobile'`
- [ ] `/calendar` tracked with `title: 'Kalender'`
- [ ] `/impressum` tracked with `title: 'Impressum'`
- [ ] Route params included in tracked URL
- [ ] Events only sent when online and consent given
- [ ] No double-tracking on SPA navigation

---

## Task Group: Integration Testing

### Task 6.0: Test error tracking

**File:** (manual testing)

**Acceptance:**

- [ ] Uncaught JS error → Matomo receives `errors` category with `uncaught` action
- [ ] Fetch 500 error → Matomo receives `errors` category with `fetch_error` action
- [ ] Component error → Matomo receives `errors` category with `component_error` action
- [ ] Error counter does not exceed 10 per session
- [ ] No user-facing alerts triggered by error tracking

### Task 6.1: Test event analytics

**File:** (manual testing)

**Acceptance:**

- [ ] Filter toggle → Matomo receives `home` category with `filter_toggle` action
- [ ] Share button → Matomo receives `events` category with `share` action
- [ ] Calendar save → Matomo receives `events` category with `calendar_save` action
- [ ] Event detail view → Matomo receives `events` category with `detail_view` action
- [ ] All events include correct eventId as label

### Task 6.2: Test PWA display mode

**File:** (manual testing)

**Acceptance:**

- [ ] Browser mode → Matomo receives `display` category with `browser` label
- [ ] Standalone mode (PWA installed) → Matomo receives `display` with `standalone` label
- [ ] Mode change detected and tracked
- [ ] Fullscreen mode tracked correctly

### Task 6.3: Test performance metrics

**File:** (manual testing)

**Acceptance:**

- [ ] LCP captured on home page load < 3000ms
- [ ] FID captured on first tap < 200ms (good)
- [ ] CLS captured across page navigation < 0.25
- [ ] Batch metrics sent when all three available
- [ ] No performance overhead from observer registration
- [ ] Observers disconnected on SPA navigation

### Task 6.4: Test offline queue

**File:** (manual testing)

**Acceptance:**

- [ ] All tracking events queued when offline
- [ ] Queue flushed on network reconnect
- [ ] Queue respects 50-event limit
- [ ] Newest events kept, oldest dropped when limit exceeded
- [ ] Heartbeat includes queued error count
