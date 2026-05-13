## ADDED Requirements

### Requirement: DJ listing shows all WP REST API DJs

The DJ listing page SHALL display all DJs from the WordPress REST API Custom Post Type, regardless of whether they have upcoming events in the selected time period.

#### Scenario: All CPT DJs are visible

- **WHEN** the DJ listing page loads
- **THEN** all DJs from the WP REST API CPT SHALL appear in the listing
- **AND** DJs with upcoming events SHALL show their event count badge normally
- **AND** DJs without upcoming events SHALL show "Keine Termine" badge with muted styling

#### Scenario: Sorting by name with count tiebreaker

- **GIVEN** multiple DJs with equal upcoming counts
- **WHEN** the DJ listing page renders
- **THEN** DJs SHALL be sorted by name (ascending, German locale)
- **AND** DJs with higher upcoming counts SHALL appear before DJs with lower counts

#### Scenario: Date filter chips provide navigation but don't hide DJs

- **GIVEN** the DJ listing page with date filter chips
- **WHEN** a user selects a date filter (e.g., "Diese Woche")
- **THEN** the date filter chips SHALL update to reflect the selection
- **AND** all DJs SHALL remain visible (not filtered by event count)
- **AND** DJs' event count badges SHALL reflect events in the selected period

## MODIFIED Requirements

### Requirement: DJ list page shows city and zero-event state

The DJ list page SHALL display city information per DJ card and clearly indicate DJs with no upcoming events.

#### Scenario: DJ card with city and upcoming events

- **GIVEN** a DJ with `nextEventCity: "Heidelberg"` and upcoming events
- **WHEN** the DJ list page renders
- **THEN** the card SHALL show "Heidelberg" in the next-event meta line
- **AND** the upcoming count badge SHALL show the count with active styling

#### Scenario: DJ card without city and zero events

- **GIVEN** a DJ with `nextEventCity: ""` and `upcomingCount: 0`
- **WHEN** the DJ list page renders
- **THEN** the card SHALL show "Kein Termin im Zeitraum" instead of a city
- **AND** the upcoming count badge SHALL show "Keine Termine" with muted styling
