# PWA Reliability Delta Specification

## Requirement: Sensitive API requests are network-only

The Service Worker SHALL NOT cache or replay newsletter, authentication, or mutating API requests.

### Scenario: Newsletter POST
- **WHEN** a POST is sent to a newsletter endpoint
- **THEN** the Service Worker does not intercept it
- **AND** no Cache API write is attempted.

## Requirement: Offline navigation has a dedicated fallback

### Scenario: Uncached page while offline
- **WHEN** a navigation request fails at the network
- **AND** the exact page is not cached
- **THEN** the Service Worker returns the precached `/offline` page.

## Requirement: Event list has an offline snapshot

### Scenario: Primary event fetch fails
- **WHEN** normal event loading fails
- **AND** a cached offline snapshot is available
- **THEN** the event store uses the snapshot rather than showing an API error.

### Scenario: Snapshot size is bounded
- **WHEN** the Worker builds an offline snapshot
- **THEN** it covers 30 days
- **AND** fetches at most 10 Tribe API pages.

## Requirement: Newsletter authenticity tokens are short-lived and single-use

### Scenario: Nonce issuance
- **WHEN** a nonce is requested
- **THEN** its server-side cache entry expires after five minutes
- **AND** the browser response is not cacheable.

### Scenario: Nonce reuse
- **WHEN** a previously consumed nonce is submitted again
- **THEN** the request is rejected.
