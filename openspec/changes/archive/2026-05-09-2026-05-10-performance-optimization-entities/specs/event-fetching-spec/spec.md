# Performance Optimization Spec

## ADDED Requirements

### Requirement: Optimized Metadata Queries
The app SHALL shift from "fetch all" client-side processing to targeted API queries for entity-heavy routes (DJs and Veranstalter) to improve initial load performance.

#### Scenario: Bounded fetch for DJ list
- **GIVEN** the user navigates to the DJs tab
- **WHEN** the route loads
- **THEN** the app SHALL fetch events for a bounded time range (e.g., 3-6 months) instead of all history
- **AND** the payload size SHALL be significantly reduced compared to an "all events" fetch

#### Scenario: Parallel Metadata Loading
- **WHEN** the `djs` or `veranstalter` route load functions execute
- **THEN** they SHALL parallelize fetching metadata (categories, venues) and event data
- **AND** the overall time to first render SHALL be reduced

### Requirement: Derived Entity Caching
The app SHALL cache the extracted lists of DJs and Organizers to enable instantaneous tab-switching after the first successful data processing.

#### Scenario: Instant tab switching
- **GIVEN** the user has already loaded the DJs page once in the current session
- **WHEN** the user switches away and then returns to the DJs tab
- **THEN** the app SHALL display the cached list of DJs immediately
- **AND** no fresh network request SHALL be required for the initial render

---

## ADDED Requirements

### Requirement: Responsive Skeleton States
The app SHALL provide immediate visual feedback via skeleton loaders that remain responsive during heavy data processing.

#### Scenario: Skeleton visibility
- **WHEN** a data fetch is in progress for the DJs or Organizer list
- **THEN** a skeleton loader matching the entity card layout SHALL be visible
- **AND** the UI SHALL NOT freeze while the browser processes the JSON response into entity stats
