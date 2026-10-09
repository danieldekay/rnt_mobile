# Design: 0.5.1 Reliability Hardening

## Worker

- Parse newsletter payloads once and validate the nonce from the parsed value.
- Store nonce cache entries with an explicit 300-second edge TTL; return nonce responses with `no-store`.
- Replace the Cache-API counter with Workers Rate Limiting bindings scoped to newsletter routes.
- Keep rate-limit bindings optional at type level so unit tests/local harnesses can run without Cloudflare bindings.
- Add `src/worker/rate-limit.ts` and `src/worker/offline-snapshot.ts` as focused Worker modules.
- Add `/api/offline-snapshot`, returning a bounded 30-day event snapshot with a maximum of 10 Tribe pages.

## Service Worker

- Cache only explicitly public GET API routes.
- Do not intercept POST/PATCH/DELETE or auth/newsletter APIs.
- Use navigation fallback order: network -> exact cached navigation -> `/offline`.
- Precache `/offline`.
- Await cache writes.

## Event data

- Restore the canonical `fetchAllEvents` maximum of 10 pages.
- Keep entity list/detail routes on bounded date windows; venue detail moves from one year to 30 days.
- Prime the offline snapshot after a successful event-list load and use it when the primary event request fails.

## CI / release

- Run Vitest in CI.
- Require check + tests + build in production deploy workflow.
- Pin the Wrangler version used for production deployment to a version supporting Rate Limiting bindings.

## Out of scope

- Migrating to server-side SvelteKit.
- Authentik/OIDC implementation.
- Background mutation sync or push notifications.
