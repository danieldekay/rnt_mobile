# Specification Delta: diagnosis-hardening-remediation

## ADDED Requirements

### Requirement: Worker responses include baseline security headers

The system SHALL include baseline security headers on all Cloudflare worker responses, including API and asset responses.

#### Scenario: Security headers on API response

- **WHEN** a client requests any `/api/*` endpoint served by the worker
- **THEN** the response includes `Content-Security-Policy`, `X-Content-Type-Options`, and `X-Frame-Options` headers

#### Scenario: Security headers on static asset response

- **WHEN** a client requests a non-API route served through worker asset fallback
- **THEN** the response includes the same baseline security headers

### Requirement: Auth status endpoint does not leak user session state

The system SHALL NOT expose whether a specific WordPress user session is currently authenticated.

#### Scenario: Generic auth-status payload

- **WHEN** a client calls `/api/wp-auth-status`
- **THEN** the response returns generic endpoint capability information
- **AND** the response does not include inferred login state derived from forwarded cookies

### Requirement: Newsletter mutation endpoints require request authenticity proof

The system SHALL reject newsletter subscribe and unsubscribe requests that do not include valid authenticity proof.

#### Scenario: Missing authenticity header is rejected

- **WHEN** a client submits subscribe or unsubscribe without the required authenticity header
- **THEN** the worker responds with an authorization error

#### Scenario: Invalid authenticity header is rejected

- **WHEN** a client submits subscribe or unsubscribe with an invalid authenticity header value
- **THEN** the worker responds with an authorization error

#### Scenario: Valid authenticity header is accepted

- **WHEN** a client submits subscribe or unsubscribe with valid request data and valid authenticity proof
- **THEN** the worker processes the request and returns the expected success or handled downstream error payload

### Requirement: Core diagnosis UX and PWA baseline improvements are present

The system SHALL implement minimum user-facing baseline improvements for accessibility and installability.

#### Scenario: Skip navigation exists

- **WHEN** a keyboard user focuses the first interactive element of the app shell
- **THEN** a visible skip link allows jumping directly to main content

#### Scenario: Manifest includes install metadata

- **WHEN** a client loads `manifest.json`
- **THEN** manifest data includes `display_override` and install-card metadata fields required by supported platforms

### Requirement: Newsletter endpoints enforce CSRF-safe request policy

Newsletter endpoints SHALL reject cross-site mutation attempts that do not include trusted authenticity proof, regardless of `Origin` header presence.

#### Scenario: Missing Origin does not bypass protections

- **WHEN** a cross-site or scripted request omits `Origin` and lacks valid authenticity proof
- **THEN** newsletter mutation endpoints reject the request

### Requirement: Worker configuration avoids plain-text sensitive operational values

Operationally sensitive worker configuration values SHALL be sourced from Cloudflare secrets instead of plain-text config files when feasible.

#### Scenario: Sendy list identifier sourced from secret

- **WHEN** worker newsletter handlers initialize configuration
- **THEN** the Sendy list identifier is loaded from secure environment secret bindings

### Requirement: Production debug logging is controlled

Production code SHALL not emit unguarded debug `console.log` statements in user-facing request paths.

#### Scenario: Resource parser logs are sanitized

- **WHEN** link/resource parsing runs in production mode
- **THEN** debug logging is disabled or replaced with controlled diagnostic logging

### Requirement: Event filtering scales for interactive search

Event filtering SHALL avoid full synchronous recomputation on every keystroke for large event sets.

#### Scenario: Search query updates are throttled

- **WHEN** users type quickly in event search
- **THEN** filtering updates are debounced or equivalent throttling is applied

#### Scenario: Filter operations use preprocessed lookup data

- **WHEN** type and music filters are applied
- **THEN** filtering logic uses preprocessed fields or indices to reduce per-update work

### Requirement: Calendar computations are memoized

Calendar view logic SHALL avoid rebuilding month/day and event maps unnecessarily between renders.

#### Scenario: Stable month data avoids rebuild churn

- **WHEN** the same month view rerenders without relevant date-window changes
- **THEN** day-grid data is reused from memoized computation

### Requirement: Map dependency loading minimizes repeat cost

Map module loading SHALL use browser and application-level caching strategy to avoid redundant load penalties across visits.

#### Scenario: Leaflet load path is optimized

- **WHEN** users revisit map-enabled views within the same app session
- **THEN** map library initialization avoids redundant heavy loading work beyond normal browser cache behavior

### Requirement: Bundle size visibility is available in build workflow

Build tooling SHALL provide bundle analysis output for dependency-size tracking.

#### Scenario: Bundle analysis report generated

- **WHEN** production build analysis is run
- **THEN** maintainers can inspect bundle composition and identify largest contributors

### Requirement: Dependency footprint is reviewed and optimized

Client dependencies SHALL be reviewed for payload efficiency and replaced or narrowed where practical.

#### Scenario: Heavy dependency usage is audited

- **WHEN** dependency audit is performed
- **THEN** each major dependency has a documented keep, optimize, or replace decision

### Requirement: Calendar event discovery is keyboard-accessible

Calendar interactions SHALL allow keyboard users to open or access event details for dates with events.

#### Scenario: Keyboard opens date event details

- **WHEN** focus is on a date button containing events and user presses Enter or Space
- **THEN** the associated event details view opens or is otherwise reachable without pointer input

### Requirement: Map event markers expose accessible labels

Map-driven event discovery SHALL provide accessible marker labels or equivalent accessible list alternatives.

#### Scenario: Screen-reader-accessible map context exists

- **WHEN** a screen-reader user navigates the map section
- **THEN** event locations are available through labeled interactive elements or an equivalent accessible event list

### Requirement: Modal focus is managed for install and update dialogs

PWA install/update modals SHALL implement focus management with modal semantics.

#### Scenario: Modal opens with trapped focus

- **WHEN** install or update modal opens
- **THEN** focus moves into the modal, remains trapped until close, and modal semantics include `aria-modal="true"`

### Requirement: Past-date visual states preserve readable contrast

Calendar past-date styling SHALL maintain WCAG AA contrast for readable text.

#### Scenario: Past-date contrast remains compliant

- **WHEN** calendar renders past-date text states
- **THEN** resulting foreground/background contrast meets applicable WCAG AA thresholds

### Requirement: Worker routing is modularized

Worker code SHALL be composed from focused handlers instead of a monolithic file.

#### Scenario: Responsibility boundaries are separated

- **WHEN** worker source structure is inspected
- **THEN** auth-status, newsletter, proxy/API, and asset-serving concerns are organized in separate modules with composed routing

### Requirement: Matomo integration is modularized

Analytics implementation SHALL be split into focused modules for configuration, tracking, error/performance capture, and offline queuing concerns.

#### Scenario: Matomo module boundaries are explicit

- **WHEN** analytics code is inspected
- **THEN** initialization, event tracking, and offline/error behavior are separated into maintainable modules

### Requirement: Filtering responsibility is not duplicated unnecessarily

Server and client filtering responsibilities SHALL be explicitly defined to avoid duplicate full-list filtering where not required.

#### Scenario: Client filtering scope is constrained

- **WHEN** server-side filters already limit dataset
- **THEN** client-side filtering performs only remaining UI-local filters (for example search) unless documented otherwise

### Requirement: Worker APIs include rate-limiting protection

Public worker API routes SHALL enforce per-client rate limits with safe defaults.

#### Scenario: Excessive request burst is limited

- **WHEN** a client exceeds allowed request rate
- **THEN** the worker returns a rate-limit response and protects upstream WordPress resources

### Requirement: Route rendering strategy avoids blanket client-only mode

Rendering configuration SHALL use route-appropriate SSR/prerender behavior instead of globally forcing client-only rendering.

#### Scenario: Content routes allow server-rendered or prerendered behavior

- **WHEN** content-oriented routes are evaluated
- **THEN** rendering mode supports SSR or prerender where compatible with deployment constraints

### Requirement: Manifest includes complete install metadata

PWA manifest SHALL include install-related metadata expected by modern platforms.

#### Scenario: Manifest declares install override and related-app preference

- **WHEN** manifest is validated
- **THEN** it includes `display_override` and `prefer_related_applications: false`

#### Scenario: Manifest declares screenshots and maskable icon

- **WHEN** install surfaces read manifest assets
- **THEN** screenshot entries and a `purpose: maskable` icon are present

### Requirement: App shell includes mobile web app meta tags

Base HTML SHALL include mobile/PWA meta tags needed for iOS and mobile standalone behavior.

#### Scenario: Mobile web app meta tags are present

- **WHEN** `src/app.html` is inspected
- **THEN** mobile web app capability and status bar meta tags are declared

### Requirement: Offline fallback behavior is explicit

Offline navigation SHALL present a dedicated offline fallback experience instead of generic index fallback only.

#### Scenario: Offline route access returns offline guidance

- **WHEN** the user navigates while offline and requested content is unavailable
- **THEN** the app presents a dedicated offline fallback page with reconnect guidance

### Requirement: App shell caching complements edge API caching

PWA caching SHALL include static app-shell strategy in addition to edge/proxy API caching.

#### Scenario: App shell loads from service worker cache

- **WHEN** network is degraded or unavailable
- **THEN** core app shell assets are served from service-worker-managed cache strategy

### Requirement: Runtime errors degrade gracefully in key routes

Key route groups SHALL provide graceful runtime error boundaries to avoid total route crashes.

#### Scenario: Component runtime error shows fallback

- **WHEN** a runtime error occurs inside key route component trees
- **THEN** users see route-appropriate fallback UI instead of raw unhandled failure

### Requirement: Data-validation utilities are either integrated or removed

Validation utilities SHALL not remain unused dead code in production bundles.

#### Scenario: Validation path is resolved

- **WHEN** data-validation module responsibilities are reviewed
- **THEN** functions are either integrated into runtime validation flow or removed with equivalent coverage preserved

### Requirement: WordPress origin configuration is centralized

WordPress base origin SHALL be configurable via environment-based central configuration used consistently across worker and client paths.

#### Scenario: Domain migration requires single-point config change

- **WHEN** the WordPress origin changes
- **THEN** maintainers update one centralized configuration source instead of many hardcoded literals

### Requirement: API response parsing uses explicit type safety

API client parsing SHALL use explicit runtime-safe typing strategy instead of broad `any` casts.

#### Scenario: Unknown API shape is handled safely

- **WHEN** upstream API shape differs from expectation
- **THEN** parsing falls back through type guards/schema validation and returns controlled errors

### Requirement: Core logic has baseline test coverage

Core business logic SHALL include test coverage for stores, worker handlers, and API behavior.

#### Scenario: Store and worker behavior are test-verified

- **WHEN** test suite runs for this change
- **THEN** events store filtering, PWA store behavior, and worker endpoint routing/hardening have automated coverage
