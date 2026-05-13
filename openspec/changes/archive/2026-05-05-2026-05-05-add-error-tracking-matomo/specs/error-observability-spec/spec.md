## ADDED Requirements

### Requirement: Track date filter changes in Matomo
The app SHALL send a `trackEvent` for `'home'` → `'date_filter_changed'` with a `$label` of the active date filter value whenever the date filter changes.

#### Scenario: User switches from 'week' to 'month'
- **WHEN** the user selects "Monat" as the date filter
- **THEN** Matomo receives `['trackEvent', 'home', 'date_filter_changed', 'month']`

#### Scenario: User switches back to 'week'
- **WHEN** the user selects "Woche" after "Monat"
- **THEN** Matomo receives `['trackEvent', 'home', 'date_filter_changed', 'week']`

#### Scenario: No-op change (already on 'week')
- **WHEN** the user selects "Woche" when "Woche" is already active
- **THEN** Matomo does NOT receive a duplicate event

### Requirement: Track error state appearance in Matomo
The app SHALL send a `trackEvent` for `'app'` → `'error_shown'` with a `$label` describing the error type when an error state appears in the UI.

#### Scenario: API fetch fails with 500
- **WHEN** `eventStore.error` becomes "Failed to fetch events: 500"
- **THEN** Matomo receives `['trackEvent', 'app', 'error_shown', 'api']`

#### Scenario: Event detail fetch fails
- **WHEN** `fetchEventById` fails on the event detail page
- **THEN** Matomo receives `['trackEvent', 'app', 'error_shown', 'api']`

#### Scenario: Error resolves (no tracking needed)
- **WHEN** the user refreshes and events load successfully
- **THEN** no error event is sent (transition from error back to null is not tracked)
