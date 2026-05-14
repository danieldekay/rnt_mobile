# Design: Address Diagnosis Findings

## Context

The diagnosis identified a full remediation backlog spanning security, performance, accessibility, architecture, PWA best-practice compliance, and code quality. The current `worker.ts` and `src/lib/matomo.ts` centralize unrelated responsibilities, while several UI and platform gaps affect mobile-first usability and maintainability. The app is deployed as a static SvelteKit build on Cloudflare Pages/Workers, so the design must preserve adapter-static compatibility while addressing all scout findings in a traceable way.

## Goals / Non-Goals

**Goals:**

- Add consistent security response headers, including CSP, across worker-served responses.
- Remove user-session inference from the WordPress auth status endpoint.
- Require explicit anti-CSRF and anti-cross-site request authenticity checks for newsletter write operations.
- Move exposed config values to worker secrets and remove production debug logging where unnecessary.
- Decompose worker responsibilities into focused modules while keeping a single composed entrypoint.
- Decompose monolithic Matomo logic into focused modules.
- Resolve performance bottlenecks in store filtering, calendar calculations, and map loading.
- Ship complete accessibility and PWA fixes identified by the scout report.
- Add runtime resilience improvements (rate limiting, error boundaries, stronger typing, and broader tests).
- Preserve Cloudflare Pages static deployment compatibility and validate build output.

**Non-Goals:**

- Introduce backend stateful sessions or a full authentication subsystem.
- Migrate deployment platform or replace Cloudflare Worker runtime.
- Redesign visual language or create unrelated feature work.

## Decisions

### 1. Central security-header middleware in worker response pipeline

- Decision: Introduce a single response-hardening utility that applies CSP and related baseline headers to all responses emitted by worker handlers.
- Rationale: Security headers are easy to miss when set per-handler; a shared post-processing layer guarantees consistency and simplifies auditability.
- Alternatives considered:
  - Per-route header setting: rejected due to omission risk.
  - Vite-only static header injection: rejected because API responses are served by worker runtime, not only static assets.

### 2. Replace auth-status probing with non-session-sensitive capability response

- Decision: Keep `/api/wp-auth-status` for compatibility but return generic endpoint availability/feature-status data without probing user session state.
- Rationale: Preserves consumer contract while removing the privacy leak vector.
- Alternatives considered:
  - Remove endpoint immediately: rejected due to potential client breakage.
  - Restrict endpoint behind privileged auth: rejected for current static and public app model.

### 3. Newsletter endpoint authenticity via explicit request token

- Decision: Require a worker-configured secret header for newsletter mutation endpoints, and reject requests without valid authenticity proof.
- Rationale: Origin checks are insufficient when `Origin` is absent; header-based shared secret is enforceable at worker edge.
- Alternatives considered:
  - Origin/Referer-only checks: rejected as bypassable.
  - Cookie-based CSRF token flow: deferred because current worker endpoint design is stateless and does not manage session cookies.

### 4. Modular worker composition with route-specific handlers

- Decision: Split `worker.ts` responsibilities into modules (security headers, newsletter handlers, auth-status handler, proxy handlers, asset fallback) and compose in one routing entry.
- Rationale: Reduces coupling, improves local reasoning, and enables narrower unit tests.
- Alternatives considered:
  - Keep monolith and add comments: rejected, does not reduce complexity.
  - Introduce heavy framework/router dependency: rejected to keep worker bundle lean.

### 5. Incremental user-facing baseline fixes in layout and manifest

- Decision: Add skip navigation affordance in layout and manifest install metadata (`display_override`, screenshots-ready structure, maskable icon declaration if available in assets).
- Rationale: Fast impact with low implementation risk and no backend dependency.
- Alternatives considered:
  - Defer all UX fixes: rejected because skip link and manifest metadata are low-cost high-value.

### 6. Test-first hardening coverage for changed logic

- Decision: Add focused tests for worker endpoint routing/hardening and events store filtering/search behavior.
- Rationale: High-risk refactors need guardrails; targeted tests provide confidence without requiring full e2e suite build-out.
- Alternatives considered:
  - Manual QA only: rejected for repeatability concerns.

### 7. Address all scout findings via category-driven implementation slices

- Decision: Implement remediation in ordered slices (security -> architecture/performance -> accessibility/PWA -> quality/testing), with an explicit task for each scout finding.
- Rationale: Ensures no findings are dropped while still enabling safe sequencing and incremental validation.
- Alternatives considered:
  - Fix only critical/high items: rejected because medium issues include architectural and compliance gaps that increase future risk.
  - Split into many separate changes: rejected for delayed risk reduction and high coordination overhead.

### 8. Route rendering strategy refinement for content and interactive views

- Decision: Replace blanket client-only rendering with route-appropriate rendering configuration so content routes can use SSR/prerender behavior while highly interactive views remain client-friendly.
- Rationale: Improves performance and SEO posture without violating static deployment constraints.
- Alternatives considered:
  - Keep global `ssr: false`: rejected due to diagnosed architectural/performance drawbacks.

### 9. Service-worker and offline fallback completion

- Decision: Add app-shell caching strategy and explicit offline fallback behavior that complements worker-side API caching.
- Rationale: Current proxy-only caching leaves app-shell offline resilience incomplete.
- Alternatives considered:
  - Keep worker-only caching: rejected due to incomplete PWA behavior.

## Risks / Trade-offs

- [CSP too strict may break analytics or external assets] -> Mitigation: start from known allowlist domains (self, Matomo, WordPress asset/connect domains), verify in local/prod logs, and iteratively tighten.
- [Header-based authenticity secret can block legitimate requests if misconfigured] -> Mitigation: add explicit env validation and clear 401/403 error messages in non-prod logs.
- [Worker refactor can alter edge-case route handling] -> Mitigation: preserve route precedence order and add routing tests for key endpoints.
- [Manifest enhancements may reference missing assets] -> Mitigation: gate screenshot/icon entries to existing files in repository and validate build output.
- [Large remediation scope increases integration risk] -> Mitigation: implement by category slices with test-first checkpoints and explicit finding-to-task traceability.
- [Rendering strategy changes may affect route behavior] -> Mitigation: validate all major routes in preview and include build-time checks.
- [Service-worker changes can introduce stale assets] -> Mitigation: use versioned cache keys and test update/refresh behavior.

## Migration Plan

1. Add modular worker utilities and route handlers behind unchanged public endpoint paths.
2. Introduce security headers and non-probing auth-status behavior with test coverage.
3. Add newsletter authenticity validation and update client calls if required by header contract.
4. Apply performance and architecture remediations (store, calendar, map, modular Matomo, filtering boundaries, rate limiting, rendering strategy).
5. Apply accessibility and PWA remediations (skip link, map/calendar interaction, focus management, manifest/meta, offline/service worker).
6. Apply code-quality remediations (error boundaries, dead-code resolution, env centralization, API typing, test expansion).
7. Run `npm run check`, `npm run build`, and targeted tests, then deploy to staging/preview.
8. Verify route health, newsletter flows, analytics behavior, install flow, and offline behavior.
9. Promote to production.

Rollback strategy:

- Revert change commit or disable strict newsletter and CSP enforcement through environment flags if an urgent production incompatibility appears.

## Open Questions

- Should CSP ship directly in enforce mode or begin in report-only mode for one release?
- Should newsletter status endpoint be mutation-protected as well, or only subscribe and unsubscribe?
- Should data-validation utilities be integrated into runtime validation paths or removed entirely as unused code?
