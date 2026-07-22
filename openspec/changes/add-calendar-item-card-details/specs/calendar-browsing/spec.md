# Delta: calendar-browsing

## MODIFIED Requirements

### Requirement: Let users inspect events for a selected date

The calendar page SHALL let the user select a day and inspect the matching events for that date through an age-friendly selected-date summary and event list whose event cards expose the same supplemental detail markers used on the home list.

#### Scenario: Select a day with events

- **WHEN** the user selects a calendar date that has one or more events
- **THEN** the selected date becomes active
- **AND** the application lists the events for that date below the calendar
- **AND** the selected-date controls remain readable and thumb-usable on mobile
- **AND** each event card shows any recognized supplemental event-detail markers available for that event

#### Scenario: Select a day without events

- **WHEN** the user selects a calendar date that has no events
- **THEN** the selected date becomes active
- **AND** the application shows a message indicating that there are no events on that day
