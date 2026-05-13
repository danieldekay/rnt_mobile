## Context

Matomo is already integrated into the app with offline queuing, sendBeacon fallback, and display-mode tracking. Currently, it tracks:
- Route views (`trackPageView`)
- Feature events: `consent.save_preferences`, `consent.accept_all`, `home-map.open`, `home-map.enable`, `event-share.native`, `event-share.copy_link`, `event-share.copy_failed`, `event-calendar.download_ics`, `event-calendar.download_failed`

What it does NOT track:
- API fetch failures (the "Fehler beim Laden" screen)
- Date filter changes on the home page
- Calendar page fetch failures

The `error` state in `eventStore` is only rendered on the home page's `{#if $eventStore.error}` block. Adding a `trackFeatureEvent` call when this block renders gives a direct error rate metric.

The date filter changes are triggered via `eventStore.setDateFilter(dateFilter)`. Adding a Matomo event here shows which filters are most/least used. Both changes are `trackFeatureEvent` calls — zero new code paths, just instrumentation.

## Decisions

### Decision: Track errors once per state change, not per render cycle
- **Choice:** Use a `$derived.by` or effect-based approach to only track when `error` transitions from null to non-null.
- **Rationale:** Tracking every render cycle would spam Matomo with the same error. A once-per-change approach is accurate and low-volume.
- **Alternative:** Track on every render, debounce in Matomo.
- **Why not:** Debatable overhead in the event loop. Better to track once in the store logic.

### Decision: Track date filter changes at the source
- **Choice:** Add `trackFeatureEvent('home', 'date_filter_changed', dateFilter)` inside `setDateFilter` in the event store.
- **Rationale:** One insertion point, all callers traced (home page and calendar page).
- **Alternative:** Track in each component.
- **Why not:** That would require duplicating the call in two places.
