# pwa-reliability Specification Delta

## ADDED Requirements

### Requirement: Navigation requests are never cache-first app-shell hits

The Service Worker SHALL route `request.mode === "navigate"` requests through a network-first navigation strategy before checking precached app-shell assets.

#### Scenario: Safari bookmark opens root path after a deploy

- **GIVEN** the user opens `/` from a Safari bookmark or installed PWA context
- **AND** a Service Worker controls the page
- **WHEN** the request is a navigation request
- **THEN** the Service Worker MUST attempt the network first
- **AND** it MUST NOT return the cached `/` app shell before the navigation strategy runs.

### Requirement: Root document is not a cache-first precache asset

The Service Worker SHALL NOT include `/` in the cache-first app-shell asset list.

#### Scenario: Old root shell exists in a previous cache

- **GIVEN** an older cache contains a root app shell document
- **WHEN** the user launches the app at `/`
- **THEN** the Service Worker MUST treat the request as navigation
- **AND** update recovery MUST not depend on matching `/` as a static asset.

### Requirement: Entry documents and update metadata are no-store

The deployed static headers SHALL mark root/HTML entry documents, `service-worker.js`, and SvelteKit version metadata as non-cacheable by the browser.

#### Scenario: Browser requests update metadata

- **WHEN** the browser requests `/service-worker.js` or `/_app/version.json`
- **THEN** the response SHOULD include `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`.
