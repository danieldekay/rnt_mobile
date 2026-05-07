# matomo-enhanced-spec

## Capability: Error Tracking

### Description

The app SHALL track uncaught errors, fetch errors, JavaScript errors, and Matomo send failures to Matomo. A maximum of 10 errors per session shall be sent to prevent flooding Matomo. No user PII shall be included in error events.

#### Scenario: Uncaught JavaScript error

- **WHEN** an uncaught JavaScript error occurs on any page
- **THEN** Matomo receives an event with `'errors'` category and `'uncaught'` action
- **AND** the event includes error type, message, timestamp, display mode, and current URL
- **AND** the error counter increments

#### Scenario: Fetch error on API request

- **WHEN** a fetch request to the WordPress API fails (network error, 404, 500)
- **THEN** Matomo receives an event with `'errors'` category and `'fetch_error'` action
- **AND** the event includes the target URL and HTTP status code

#### Scenario: Error page load

- **WHEN** the error page (`+error.svelte`) loads with an error
- **THEN** Matomo receives an event with `'errors'` category and `'error_page'` action
- **AND** the event includes the error details

#### Scenario: Error session limit reached

- **WHEN** 10 errors have already been tracked in the current session
- **THEN** no further error events are sent to Matomo
- **AND** the error counter resets on session restart

#### Scenario: Error silently swallowed

- **WHEN** any error tracking call fails silently
- **THEN** no user-facing alert is shown
- **AND** no console.error is printed

---

## Capability: Event Analytics

### Description

The app SHALL track user interaction events — filter toggles, share actions, calendar events, map toggles — to Matomo for analytics and user behavior analysis.

#### Scenario: Filter toggle on home page

- **WHEN** the user toggles a filter (e.g., "Milonga", "Practica") on the home page
- **THEN** Matomo receives an event with `'home'` category and `'filter_toggle'` action
- **AND** the event includes the filter name as a label

#### Scenario: Date filter toggle on home page

- **WHEN** the user toggles a date filter (e.g., "Heute", "Woche", "Monat") on the home page
- **THEN** Matomo receives an event with `'home'` category and `'date_filter_toggle'` action
- **AND** the event includes the selected date range as a label

#### Scenario: Image toggle on home page

- **WHEN** the user toggles the image display on/off on the home page
- **THEN** Matomo receives an event with `'home'` category and `'image_toggle'` action
- **AND** the event includes the display state as a label

#### Scenario: Map toggle on home page

- **WHEN** the user toggles the map view on/off on the home page
- **THEN** Matomo receives an event with `'home'` category and `'map_toggle''` action
- **AND** the event includes the map state as a label

#### Scenario: Share action on event detail

- **WHEN** the user clicks the share button on an event detail page
- **THEN** Matomo receives an event with `'events'` category and `'share'` action
- **AND** the event includes the event ID as a label

#### Scenario: Save action on event detail

- **WHEN** the user clicks the save button on an event detail page
- **THEN** Matomo receives an event with `'events'` category and `'save'` action
- **AND** the event includes the event ID as a label

#### Scenario: Calendar save on event detail

- **WHEN** the user adds an event to their calendar from the event detail page
- **THEN** Matomo receives an event with `'events'` category and `'calendar_save'` action
- **AND** the event includes the event ID as a label

#### Scenario: Event detail view

- **WHEN** the user navigates to an event detail page
- **THEN** Matomo receives an event with `'events'` category and `'detail_view'` action
- **AND** the event includes the event ID as a label

#### Scenario: In-map marker click on event

- **WHEN** the user clicks an in-map event marker
- **THEN** Matomo receives an event with `'events'` category and `'map_marker_click'` action
- **AND** the event includes the event ID as a label

#### Scenario: Back button click on event detail

- **WHEN** the user clicks the back button on an event detail page
- **THEN** Matomo receives an event with `'events'` category and `'back_click'` action

---

## Capability: Display Mode Detection

### Description

The app SHALL detect and track the browser/display mode to distinguish PWA (standalone) installations from regular browser visits in Matomo analytics.

#### Scenario: Detect standalone (PWA installed)

- **WHEN** the app loads with `window.matchMedia('(display-mode: standalone)').matches` true
- **THEN** `getDisplayMode()` returns `'standalone'`
- **AND** Matomo receives an event with `'display'` category and `'mode_change'` action
- **AND** the event includes `'standalone'` as the label

#### Scenario: Detect browser mode

- **WHEN** the app loads with no PWA manifest active
- **THEN** `getDisplayMode()` returns `'browser'`
- **AND** Matomo records the mode for the current session

#### Scenario: Detect fullscreen mode

- **WHEN** the app is displayed in fullscreen mode
- **THEN** `getDisplayMode()` returns `'fullscreen'`

#### Scenario: Detect minimal-ui mode

- **WHEN** the app displays in minimal-ui mode
- **THEN** `getDisplayMode()` returns `'minimal-ui'`

#### Scenario: Track display mode change

- **WHEN** the user installs the PWA while the app is open
- **THEN** a display mode change event is tracked with the new mode

---

## Capability: Performance Metrics

### Description

The app SHALL track core web vitals — LCP (Largest Contentful Paint), FID (First Input Delay), and CLS (Cumulative Layout Shift) — via `PerformanceObserver` to Matomo for mobile performance analysis.

#### Scenario: LCP tracked on page load

- **WHEN** the initial page load completes
- **THEN** `PerformanceObserver` captures the LCP value
- **AND** Matomo receives an event with `'performance'` category and `'lcp'` action
- **AND** the event includes the LCP value in milliseconds

#### Scenario: FID tracked on first interaction

- **WHEN** the user performs the first interaction (tap/click) on a loaded page
- **THEN** `PerformanceObserver` captures the FID value
- **AND** Matomo receives an event with `'performance'` category and `'fid'` action
- **AND** the event includes the FID value in milliseconds

#### Scenario: CLS tracked across navigations

- **WHEN** cumulative layout shifts occur during page rendering
- **THEN** `PerformanceObserver` captures the CLS score
- **AND** Matomo receives an event with `'performance'` category and `'cls'` action
- **AND** the event includes the CLS value

#### Scenario: All performance metrics batched

- **WHEN** LCP, FID, and CLS are all available
- **THEN** a batched event is sent to Matomo with all three metrics
- **AND** the event includes lcp, fid, and cls values

#### Scenario: Performance tracking minimal overhead

- **WHEN** performance observers are active
- **THEN** the overhead does not impact page render time
- **AND** no significant delay is introduced

---

## Capability: Offline Queue Integration

### Description

All Matomo tracking events (errors, analytics, performance, display mode) SHALL be queued offline via the existing `matomo-offline.ts` queue and flushed on reconnect.

#### Scenario: Track event queued when offline

- **WHEN** the device is offline and a tracking call is made
- **THEN** the event is stored in the matomo offline queue
- **AND** the queue displays the correct item count

#### Scenario: Queue flush on reconnect

- **WHEN** the device goes back online after being offline
- **THEN** all queued events are sent to Matomo sequentially
- **AND** the queue is cleared after successful flush

#### Scenario: Queue limited to 50 events

- **WHEN** more than 50 events are queued
- **THEN** the oldest events are dropped
- **AND** the queue maintains a maximum of 50 items

#### Scenario: Heartbeat includes error queue count

- **WHEN** the heartbeat is sent
- **THEN** the heartbeat includes the current queue depth
- **AND** the heartbeat includes performance metrics if available

---

## Capability: Page View Tracking

### Description

All route changes SHALL be tracked in Matomo with a page view event including the route URL and page title. All tracking calls SHALL be gated by consent.

#### Scenario: Route change tracked

- **WHEN** the user navigates from one route to another
- **THEN** Matomo receives a page view event with the previous and new route
- **AND** the event includes the page title

#### Scenario: Consent gates all tracking

- **WHEN** user consent for analytics is not given
- **THEN** no Matomo tracking events are sent
- **AND** no offline queue writes are made

#### Scenario: Home page view tracked

- **WHEN** the user loads the home page (`/`)
- **THEN** Matomo receives a page view event with URL `'/'` and title `'rnt_mobile'`

#### Scenario: Calendar page view tracked

- **WHEN** the user loads the calendar page (`/calendar`)
- **THEN** Matomo receives a page view event with URL `'/calendar'` and title `'Kalender'`

#### Scenario: Legal page view tracked

- **WHEN** the user loads impressum, datenschutz, cookie, or was-ist-neu pages
- **THEN** Matomo receives page view events for each route

---

## Capability: Route Initialization

### Description

The root layout (`+layout.svelte`) SHALL initialize all global tracking on mount: error tracking, performance tracking, and display mode tracking.

#### Scenario: Error tracking initialized on mount

- **WHEN** `+layout.svelte` mounts
- **THEN** `setupErrorTracking()` is called
- **AND** global error listeners are registered

#### Scenario: Performance tracking initialized on mount

- **WHEN** `+layout.svelte` mounts
- **THEN** `setupPerformanceTracking()` is called
- **AND** PerformanceObserver instances are created

#### Scenario: Display mode tracking initialized on mount

- **WHEN** `+layout.svelte` mounts
- **THEN** `setupDisplayModeTracking()` is called
- **AND** display mode change listeners are registered

#### Scenario: No console errors on initialization

- **WHEN** the app starts with all trackers initialized
- **THEN** no console warnings or errors are emitted
- **AND** the initialization does not block page renders
