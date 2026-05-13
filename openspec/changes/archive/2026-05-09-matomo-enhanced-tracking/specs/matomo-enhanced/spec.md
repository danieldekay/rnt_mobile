# matomo-enhanced-spec

## ADDED Requirements

### Requirement: Error Tracking
The app SHALL track uncaught errors, fetch errors, JavaScript errors, and Matomo send failures to Matomo. A maximum of 10 errors per session SHALL be sent to prevent flooding Matomo. No user PII SHALL be included in error events.

#### Scenario: Uncaught JavaScript error
- **WHEN** an uncaught JavaScript error occurs on any page
- **THEN** Matomo receives an event with `'errors'` category and `'js-error'` action
- **AND** the event includes error message, filename, and line number
- **AND** the error counter increments

#### Scenario: Promise rejection
- **WHEN** an unhandled promise rejection occurs
- **THEN** Matomo receives an event with `'errors'` category and `'promise-rejection'` action
- **AND** the event includes the rejection reason

#### Scenario: Error session limit reached
- **WHEN** 10 errors have already been tracked in the current session
- **THEN** no further error events are sent to Matomo

---

## ADDED Requirements

### Requirement: Event Analytics
The app SHALL enhance event analytics with detailed interaction tracking for filters, sharing, and navigation.

#### Scenario: Filter toggle on home page
- **WHEN** the user toggles a filter (e.g., "Milonga", "Practica") on the home page
- **THEN** Matomo receives an event with `'newsletter'` (if applicable) or component category
- **AND** the event includes the action and display mode

#### Scenario: Share action on event detail
- **WHEN** the user clicks the share button on an event detail page
- **THEN** Matomo receives an event with `'newsletter'` or `'events'` category
- **AND** the event includes the action and display mode

---

## ADDED Requirements

### Requirement: Display Mode Detection
The app SHALL detect and track the browser/display mode to distinguish PWA (standalone) installations from regular browser visits in Matomo analytics.

#### Scenario: Detect standalone (PWA installed)
- **WHEN** the app loads with `display-mode: standalone`
- **THEN** `getMatomoDisplayMode()` returns `'standalone'`
- **AND** Matomo receives a custom dimension with value `'standalone'`

#### Scenario: Track display mode change
- **WHEN** the user installs the PWA while the app is open
- **THEN** the display mode SHALL be updated and tracked in Matomo

---

## ADDED Requirements

### Requirement: Performance Metrics
The app SHALL track core web vitals — LCP (Largest Contentful Paint), FID (First Input Delay), and CLS (Cumulative Layout Shift) — via `PerformanceObserver` to Matomo.

#### Scenario: LCP tracked on page load
- **WHEN** the initial page load completes and LCP is detected
- **THEN** Matomo receives an event with `'performance'` category and `'lcp'` action
- **AND** the event includes the LCP value in milliseconds

#### Scenario: FID tracked on first interaction
- **WHEN** the user performs the first interaction
- **THEN** Matomo receives an event with `'performance'` category and `'fid'` action

---

## ADDED Requirements

### Requirement: Offline Queue Integration
All Matomo tracking events SHALL be queued offline via `localStorage` and SHALL be flushed on reconnect.

#### Scenario: Track event queued when offline
- **WHEN** the device is offline and a tracking call is made
- **THEN** the event is stored in `matomo-pending-events` in `localStorage`

#### Scenario: Queue flush on reconnect
- **WHEN** the device goes back online
- **THEN** all queued events SHALL be sent to Matomo sequentially
- **AND** the queue SHALL be cleared

---

## ADDED Requirements

### Requirement: Page View Tracking
The app SHALL enhance page view tracking to include display mode and custom dimensions for better PWA analytics.

#### Scenario: Route change tracked
- **WHEN** the user navigates from one route to another
- **THEN** Matomo receives a page view event with the new URL and title
- **AND** the current display mode SHALL be attached as a custom dimension
