# Spec Delta: home-event-browsing

## ADDED Requirements

### Requirement: Home users can append the next 7-day range from the list footer

The home page SHALL let users extend the default 7-day event list with the next chronological 7-day range from the bottom of the list instead of replacing the events that are already visible.

#### Scenario: Append the next week of events

- **WHEN** the user is browsing the home event list for the 7-day preset and activates the next-period action at the bottom of the list
- **THEN** the application requests the next chronological 7-day range after the current loaded window
- **AND** appends the newly returned events below the existing cards in chronological order

#### Scenario: Appended results become part of the current working list

- **WHEN** the next 7-day range has been appended successfully
- **THEN** the home page keeps the previously loaded events visible
- **AND** treats the appended events as part of the current list for subsequent browsing, filtering, and searching during the active session

### Requirement: Home list footer keeps navigation understandable on mobile

The home page SHALL provide bottom-of-list navigation controls that remain easy to understand and tap on mobile devices.

#### Scenario: User reaches the bottom of the home list on mobile

- **WHEN** the user reaches the bottom of the home list on a mobile viewport
- **THEN** the interface presents a jump-to-top action
- **AND** presents the next-period action with wording that makes the chronological continuation clear

### Requirement: Append failures do not discard loaded home events

The home page SHALL keep already loaded event cards on screen when loading the next 7-day range fails.

#### Scenario: Next-period request fails

- **WHEN** the user requests the next 7-day range and the request fails
- **THEN** the home page keeps the existing event cards visible
- **AND** communicates the append error near the list footer
- **AND** allows the user to retry the next-period request
