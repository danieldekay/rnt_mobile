# Implementation tasks — RNT Mobile 1.0 (#117)

> Test first; one OpenSpec change / worktree, bounded delivery PRs. Check AGENTS.md, #56/#106, existing PRs/planning branches and Beads. **All tasks are unimplemented until accepted with evidence.**

## 0. Baseline and contracts
- [ ] T001 Audit current `src/lib/api/tribe.ts`, event store, list/calendar/map/detail and entity routes, Worker/session/caches, existing tests and OpenSpec; record baseline and actual API-contract gaps.
- [ ] T002 Write failing adapter fixture tests against TangoAtlas #531 for one-off, weekly/monthly RRULE occurrence, exception, timezone and linked venue/organizer/DJ; include empty/partial/offline.
- [ ] T003 Confirm portal read key handling (server-only if required), provider configuration and cache isolation. Do not rely on imagined TangoAtlas routes.

## 1. Read-only provider (first demonstrable outcome)
- [ ] T004 Implement typed TangoAtlas adapter + store projection; keep current WordPress provider as controlled fallback until release approval.
- [ ] T005 Verify list/calendar/details/search/filter/map, pagination, recurrence, fresh/stale state, stable IDs and no WordPress calls in TangoAtlas mode. Record commands and screenshots selectively.

## 2. Organizer creation/editing and authorization
- [ ] T006 Inspect #56 current Authentik Worker OIDC state; agree actual TangoAtlas #532 user token/session trust boundary. Add failing two-organizer, moderator, 401/403/cache-leak tests.
- [ ] T007 Build accessible **Veranstaltung hinzufügen** UI: URL suggestion via existing TangoAtlas intake where available, short manual fallback; submit through backend moderation, surface accurate status.
- [ ] T008 Build authorized event edit/propose form, fresh revision token/409 conflict recovery, no blind repeat writes; denied user cannot mutate another's event.
- [ ] T009 After #389 supported write contract, enable recurring monthly/weekly selectors, cancellations and per-occurrence reschedules; test DST and fifth-Saturday only-in-valid-months.

## 3. Release 1.0 gate (not authorized by this planning PR)
- [ ] T010 Inventory upcoming WordPress/Tribe one-off and active recurring events and exceptions; prove current/future coverage in TangoAtlas, record stable ID/URL mappings and intentional exclusions; full legacy history optional.
- [ ] T011 Run `npm run test:run`, `npm run check`, `npm run build`, mobile/desktop local E2E with two users+moderator, PWA/offline/auth security; write PASS/FAIL/SKIPPED exact evidence.
- [ ] T012 Test staging, back/forward links/SEO, data freshness, rollback and permission revocation. Request explicit production cutover approval and separately verify deployment. Do not stop the paid WordPress subscription automatically.

## Deferred
Autonomous Hermes Scout roll-out, historical backfill, complete TangoAtlas entity/admin editor, new WP plugin, TMD Mobile changes, ticketing/RSVP and general-purpose ingestion framework.
