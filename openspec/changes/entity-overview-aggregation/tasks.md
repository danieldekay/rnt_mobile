# Tasks: Compact Entity Overview Aggregation

- [x] Add reusable bounded concurrent Worker event fetcher.
- [x] Refactor offline snapshot to use the shared bounded fetcher.
- [x] Add cached compact `/api/entity-overview` Worker endpoint.
- [x] Add client inflater and explicit coverage metadata.
- [x] Migrate DJ list to the shared overview feed.
- [x] Migrate organizer list to the shared overview feed.
- [x] Migrate venue list to the shared overview feed.
- [x] Add Service Worker cache policy for the overview feed.
- [x] Surface truncation warnings rather than silently incomplete counts.
- [x] Add bounded-fetch, Worker endpoint, client, and cache-policy regression tests.
- [ ] Run test, type-check, build, and Worker dry-run CI.
- [ ] Measure production request/payload behavior after deployment and record follow-up only if the 10-page budget is approached.
