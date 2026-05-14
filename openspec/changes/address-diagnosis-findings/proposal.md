# Proposal: Address Diagnosis Findings

## Why

The scout diagnosis identified critical, high, medium, and low findings across security, performance, accessibility, architecture, PWA compliance, and code quality. Addressing the full findings set in one coordinated change reduces security risk, prevents regressions from piecemeal fixes, and improves baseline reliability for future features.

## What Changes

- Add baseline response hardening in the Cloudflare worker, including CSP and related security headers.
- Remove session-probing behavior from WordPress auth status handling so user login state cannot be inferred.
- Harden newsletter endpoints against cross-site abuse by enforcing explicit request authenticity checks and robust CSRF defenses.
- Move exposed infrastructure configuration values to secure worker secrets where applicable.
- Remove production debug logging leakage in resource parsing code.
- Refactor the monolithic worker into focused handler modules to improve readability, testability, and change safety.
- Refactor monolithic analytics logic into focused Matomo modules.
- Improve performance hotspots in event filtering, calendar computations, and map loading behavior.
- Add bundle analysis and dependency optimization tasks to reduce payload cost.
- Add accessibility fixes: skip links, calendar interaction affordances, map labeling, modal focus management, and contrast corrections.
- Add PWA compliance fixes: enhanced manifest fields, maskable icon support, mobile web app meta tags, offline fallback handling, and service-worker app-shell caching.
- Add architecture and quality hardening: clearer filtering boundaries, worker rate limiting, route rendering strategy updates, runtime error boundaries, dead-code cleanup decisions, centralized origin config, stronger API typing, and broader test coverage.

## Capabilities

### New Capabilities

- `diagnosis-hardening-remediation`: End-to-end remediation requirements covering all scout findings across security, performance, accessibility, architecture, PWA best practices, and code quality.

### Modified Capabilities

- `security-defense-spec`: Tighten endpoint behavior and response-header protections for worker APIs.
- `newsletter`: Enforce anti-CSRF request validation and origin/authenticity checks for subscribe/unsubscribe/status endpoints.
- `architecture`: Require modular worker handler composition instead of a single-file proxy/controller.
- `matomo-enhanced`: Require modular analytics implementation boundaries to reduce monolithic tracking complexity.

## Impact

- Affected code: worker entry and endpoint handlers, newsletter flow, Matomo modules, routes and layouts, PWA manifests/meta/service-worker assets, events and PWA stores, API client typing, and test suites.
- Affected routes/views: home, calendar, event detail, blog/resources, legal pages, and global layout/app shell behaviors.
- APIs and data shape: auth-status response becomes non-session-probing; newsletter endpoints enforce stricter request validation; API client response typing becomes explicit.
- Deployment: static adapter output remains compatible with Cloudflare Pages/Workers; no change to deployment target, but worker behavior and headers change across all responses.
