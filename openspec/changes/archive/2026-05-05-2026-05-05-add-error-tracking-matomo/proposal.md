## Why

The app has no error tracking whatsoever. API failures, store errors, and Matomo issues are either silently swallowed or logged only to `console.error`. The developer cannot see how often the "Fehler beim Laden" screen appears, what date filters users choose most, or whether specific event types cause more fetch failures. Without this visibility, debugging production issues is guesswork and the Matomo analytics only tracks user actions — they don't track app health.

Adding two Matomo events — one for error-state visibility and one for date-filter changes — gives 80% of error observability without new dependencies or infra, leveraging the existing Matomo setup with offline queuing and sendBeacon fallback.

## What Changes

- Add `trackFeatureEvent('home', 'date_filter_changed', dateFilter)` when the date filter changes on the home page.
- Add `trackFeatureEvent('app', 'error_shown', errorType)` in the home page when an error state is displayed.
- Add corresponding Matomo dimension for event type in the calendar page.

## Capabilities

### Modified Capabilities
- `error-observability`: Adds Matomo error tracking and date filter tracking to the home and calendar pages, enabling production visibility into error rates and filter usage without new dependencies.

## Impact

- Affected files: `src/routes/+page.svelte`, `src/lib/stores/events.svelte.ts`, `src/lib/matomo.ts` (if needed for new event types).
- No API changes, no data-shape changes.
- No deployment-model changes.
