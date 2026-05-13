# Capability: Show All WP API DJs

## Purpose

Extend the DJ listing to include all DJs from the WordPress REST API Custom Post Type, regardless of whether they have upcoming events in the selected time period.

---

## Requirement: Show all WP API DJs in listing

The DJ listing page SHALL include all DJs from the WP REST API Custom Post Type when the "Show all WP API DJs" toggle is enabled, regardless of their upcoming event count.

### Scenario: Toggle enabled shows DJs with zero events
- **GIVEN** the "Show all WP API DJs" toggle is enabled
- **AND** a DJ exists in the WP REST API CPT with no events in the selected time period
- **WHEN** the DJ listing page loads
- **THEN** that DJ SHALL appear in the listing
- **AND** the DJ's upcoming count badge SHALL show "Keine Termine"
- **AND** the DJ card SHALL use muted visual styling to indicate the zero-event state

### Scenario: Toggle disabled maintains existing behavior
- **GIVEN** the "Show all WP API DJs" toggle is disabled (default)
- **AND** a DJ exists in the WP REST API CPT with no events in the selected time period
- **WHEN** the DJ listing page loads
- **THEN** that DJ SHALL NOT appear in the listing
- **AND** the behavior SHALL match the pre-change functionality

### Scenario: Toggle persists user preference
- **GIVEN** a user enables the "Show all WP API DJs" toggle
- **AND** the user navigates away from the DJ listing page
- **WHEN** the user returns to the DJ listing page
- **THEN** the toggle SHALL remain enabled
- **AND** the listing SHALL show all WP API DJs including those with zero events

### Scenario: Sorting works with zero-event DJs
- **GIVEN** the "Show all WP API DJs" toggle is enabled
- **AND** multiple DJs exist with varying event counts (including zero)
- **WHEN** the DJ listing page loads
- **THEN** DJs SHALL be sorted by upcoming count (descending), then by name (ascending)
- **AND** DJs with zero events SHALL appear after DJs with events when counts are equal