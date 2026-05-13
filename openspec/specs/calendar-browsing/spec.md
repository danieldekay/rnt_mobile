# Capability: Calendar Browsing

## Purpose

Describe how users browse the currently loaded event set in a month calendar and inspect the events assigned to a selected day.

## Requirements

### Requirement: Show a month calendar populated from all loaded events
The calendar page SHALL load events for broad calendar browsing and show them in a month grid that uses clear contrast, readable labels, and distinct day states.

#### Scenario: Open the calendar page
- **WHEN** the user opens `/calendar`
- **THEN** the application switches the event date filter to all
- **AND** reloads the event data for calendar browsing
- **AND** renders the current month in a calendar grid with high-contrast day cells and labels

#### Scenario: Days with events are visually distinguished
- **WHEN** the current month contains one or more dates with events
- **THEN** those dates are visually distinguished in the calendar grid
- **AND** the current day is highlighted separately from the other dates
- **AND** the distinctions remain understandable without relying on color alone

### Requirement: Let users inspect events for a selected date
The calendar page SHALL let the user select a day and inspect the matching events for that date through an age-friendly selected-date summary and event list.

#### Scenario: Select a day with events
- **WHEN** the user selects a calendar date that has one or more events
- **THEN** the selected date becomes active
- **AND** the application lists the events for that date below the calendar
- **AND** the selected-date controls remain readable and thumb-usable on mobile

#### Scenario: Select a day without events
- **WHEN** the user selects a calendar date that has no events
- **THEN** the selected date becomes active
- **AND** the application shows a message indicating that there are no events on that day

### Requirement: Guide the user before any date is selected
The calendar page SHALL explain what to do before the user has selected a date.

#### Scenario: No date selected yet
- **WHEN** the calendar page has loaded and the user has not selected a date yet
- **THEN** the application shows a prompt asking the user to tap a day to see events

### Requirement: Keep day navigation explicit in the selected-date summary
The calendar page SHALL provide explicit previous-day, next-day, and today actions once a date has been selected.

#### Scenario: Move between nearby dates from the summary
- **WHEN** the user has selected a date in the calendar
- **THEN** the selected-date summary provides explicit controls to move to the previous day, the next day, or today
- **AND** those actions preserve the same readable, high-contrast interaction style as the rest of the page