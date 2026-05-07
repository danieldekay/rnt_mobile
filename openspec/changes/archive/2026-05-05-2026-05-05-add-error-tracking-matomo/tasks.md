## ADDED Requirements

### Requirement: Track date filter changes in Matomo
- [x] 1.1 Add `trackFeatureEvent('home', 'date_filter_changed', dateFilter)` call inside `setDateFilter()` in `events.svelte.ts`
- [x] 1.2 Ensure the event is only tracked when the date filter actually changes (skip if `date` is the same)

### Requirement: Track error state appearance in Matomo
- [x] 2.1 Add `trackFeatureEvent('app', 'error_shown', eventType)` call when `$eventStore.error` transitions to a non-null value
- [x] 2.2 Ensure error tracking fires once per error state change, not per render cycle
- [x] 2.3 The error type label should be a short, human-readable string (e.g., "api", "parse", "timeout")

### Requirement: No regression in Matomo behavior
- [x] 3.1 Matomo offline queuing still works (new events are added to pending queue)
- [x] 3.2 Display mode dimension is still included in tracked events
- [x] 3.3 Matomo events fire only when consent for analytics is given
