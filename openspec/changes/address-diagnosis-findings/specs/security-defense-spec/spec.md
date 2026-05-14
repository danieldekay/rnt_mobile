# Specification Delta: security-defense-spec

## MODIFIED Requirements

### Requirement: Block self-executing HTML in sanitized descriptions

The `sanitizeHtml()` function in `src/lib/utils/html.ts` SHALL reject `on*` attributes and `<svg>`/`<math>` elements from event description HTML.

#### Scenario: Malicious SVG onload is stripped

- **WHEN** `sanitizeHtml` receives `<svg onload="alert(1)">`, an SVG element with any `on*` attribute
- **THEN** the output HTML does NOT contain that element or attribute

#### Scenario: Malicious inline event attributes are stripped

- **WHEN** `sanitizeHtml` receives `<div onclick="alert(1)">Hello</div>`
- **THEN** the output HTML does NOT contain the `onclick` attribute

#### Scenario: Legitimate event description still renders correctly

- **WHEN** `sanitizeHtml` receives a normal WordPress event description with `<p>`, `<strong>`, `<a>`, `<br>`, etc.
- **THEN** the output HTML preserves all safe tags and attributes

### Requirement: No behavioral regression in event detail rendering

The event detail view SHALL preserve rendering behavior for valid sanitized descriptions.

#### Scenario: Valid description rendering remains stable

- **WHEN** the detail page renders `sanitizedDescription`
- **THEN** correctly formed event descriptions render identically to before the security fix

### Requirement: Worker responses apply baseline defensive headers

The worker SHALL apply baseline defensive response headers consistently across API and asset responses.

#### Scenario: Defensive headers included

- **WHEN** any worker route returns a response
- **THEN** the response includes `Content-Security-Policy`, `X-Content-Type-Options`, and `X-Frame-Options`

#### Scenario: CSP allows required first-party and approved third-party resources

- **WHEN** the app loads production pages that use approved analytics and WordPress-backed resources
- **THEN** those resources load successfully within the configured CSP policy
- **AND** non-approved script sources remain blocked

### Requirement: Auth-status endpoint is non-probing

The worker SHALL NOT infer or expose whether a caller-provided WordPress session cookie is currently authenticated.

#### Scenario: Session cookie does not change auth-status visibility

- **WHEN** different callers provide no cookie, invalid cookies, or valid WordPress cookies to `/api/wp-auth-status`
- **THEN** the response shape and semantics remain generic and non-session-sensitive
