# event-fetching-spec Specification

## Purpose
TBD - created by archiving change 2026-05-05-limit-fetchall-pagination. Update Purpose after archive.
## Requirements
### Requirement: fetchAllEvents is bounded by a maximum page count
The `fetchAllEvents()` function SHALL NOT fetch more than 10 pages of results, regardless of `total_pages` returned by the API.

#### Scenario: API returns 100 pages but app fetches 10
- **WHEN** `fetchAllEvents` is called and the API reports `total_pages: 100`
- **THEN** exactly 10 pages are fetched and the function returns

#### Scenario: API has fewer pages than the max
- **WHEN** `total_pages` is 3
- **THEN** 3 pages are fetched and `hasMore` becomes false after page 3

### Requirement: fetchAllEvents is bounded by a global timeout
The `fetchAllEvents()` function SHALL abort all in-flight requests after 2 minutes and return whatever events have been collected.

#### Scenario: Slow API or infinite total_pages triggers timeout
- **WHEN** fetching exceeds 2 minutes total
- **THEN** all requests are aborted via `AbortController`
- **AND** the function returns whatever events were already collected

#### Scenario: Fetch completes within the timeout
- **WHEN** all 10 pages complete in under 2 minutes
- **THEN** no abort occurs and all collected events are returned

### Requirement: Graceful handling when events are partial
The `fetchAllEvents()` function SHALL handle partial results gracefully without throwing errors to the caller when a fetch is aborted or truncated.

#### Scenario: Partial events returned
- **WHEN** `fetchAllEvents` is aborted or the API returns fewer pages than requested
- **THEN** the caller receives all events collected so far (no error thrown)
- **AND** no `AbortError` is propagated to the calling code

### Requirement: Responsive Skeleton States
The app SHALL provide immediate visual feedback via skeleton loaders that remain responsive during heavy data processing.

#### Scenario: Skeleton visibility
- **WHEN** a data fetch is in progress for the DJs or Organizer list
- **THEN** a skeleton loader matching the entity card layout SHALL be visible
- **AND** the UI SHALL NOT freeze while the browser processes the JSON response into entity stats

