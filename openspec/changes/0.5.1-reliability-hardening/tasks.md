# Tasks: 0.5.1 Reliability Hardening

## Runtime correctness

- [x] Parse newsletter request payload once.
- [x] Enforce one-time newsletter nonce validation after parsing.
- [x] Store nonce with explicit five-minute cache TTL and return client response as no-store.
- [x] Replace Cache-API global rate limiter with route-scoped Workers Rate Limiting bindings.
- [x] Add regression tests for newsletter nonce/parsing/rate limiting.

## PWA / offline

- [x] Restrict Service Worker API caching to public GET endpoints.
- [x] Fix explicit offline navigation fallback.
- [x] Await Service Worker cache writes.
- [x] Add bounded 30-day offline snapshot Worker endpoint.
- [x] Add event-store snapshot priming and fallback.
- [x] Add offline-snapshot Worker tests.

## Event loading

- [x] Restore 10-page maximum in `fetchAllEvents`.
- [x] Bound venue detail event loading to 30 days.
- [x] Add/verify pagination regression coverage.

## Worker architecture

- [x] Extract route-scoped rate-limit logic from the Worker entrypoint.
- [x] Extract generic public JSON proxy/cache logic from the Worker entrypoint.
- [x] Isolate the offline snapshot implementation as a Worker module.

## Delivery

- [x] Add Vitest job to CI.
- [x] Gate production deployment on check, tests, and build.
- [x] Pin production Wrangler version.
- [x] Add a Wrangler dry-run to PR CI so Worker bundling/config is validated.
- [ ] Run CI, type checks, tests, app build, and Worker dry-run on the pull request.

## Repository consistency

- [x] Bump release to 0.5.1 and add release notes.
- [x] Update architecture/config/inventory documentation.
- [x] Remove temporary/backup artifacts from mainline.
- [x] Reconcile and clean stale GitHub issues.
- [x] Archive/supersede completed active OpenSpec proposals.
