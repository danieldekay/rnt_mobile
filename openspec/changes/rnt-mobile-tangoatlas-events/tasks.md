# Tasks

- [ ] T001 Reconcile issue #117, current code, pending PRs, `openspec/config.yaml`, planning branches and relevant Beads tasks. Inspect #56, #106 and TangoAtlas #531/#532.
- [ ] T002 Capture existing list/calendar/details fixtures; add failing adapter contract tests against representative TangoAtlas responses (one-off, recurrence, exception, people/venue).
- [ ] T003 Implement a minimal config-selectable TangoAtlas read adapter mapping canonical event/occurrence identity into existing Svelte store; preserve WordPress production default.
- [ ] T004 Verify local browse/search/filter/calendar/map/detail/empty/offline behavior with no Tribe API request in TangoAtlas mode.
- [ ] T005 Reconcile Authentik Worker OIDC work in #56 and determine TangoAtlas backend #532 session/write trust contract; tests first for two identities.
- [ ] T006 Implement minimal authorized event edit/proposal UI, revision/conflict handling, permission-aware controls and accurate moderation status feedback, after #532.
- [ ] T007 Test 401, 403, 409, validation, duplicate submit, expired session, cache isolation, and the successful owner edit path.
- [ ] T008 Record precise `npm run test:run`, `npm run check`, `npm run build` and local E2E evidence with PASS/FAIL/SKIPPED and screenshots where useful.
- [ ] T009 Open bounded implementation PR(s); keep separately approved production cutover and WordPress retirement as release tasks.

Stop after each shippable milestone. Follow repo OpenSpec/Beads workflow. Never merge/deploy or change production automatically.
