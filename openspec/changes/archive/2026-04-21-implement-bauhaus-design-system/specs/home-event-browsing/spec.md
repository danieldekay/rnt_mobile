## MODIFIED Requirements

### Requirement: Let users narrow the event list with date and type filters
The home page SHALL support narrowing the loaded event list with large, labeled, high-contrast date presets and event type chips that remain thumb-usable on mobile devices.

#### Scenario: Change the date filter
- **WHEN** the user selects a different date preset such as today, week, month, or all
- **THEN** the application updates the active date filter
- **AND** reloads the event list for the selected date range
- **AND** presents the selected preset with an explicit active state that is visible without relying on color alone

#### Scenario: Toggle an event type
- **WHEN** the user activates or deactivates an event type chip
- **THEN** the application updates the selected event types
- **AND** reloads the event list using the selected type filters
- **AND** renders the chip state with sufficient size, contrast, and visible selection affordance for mobile use

### Requirement: Support list-level presentation toggles
The home page SHALL allow the user to switch image visibility and switch between list and map presentation using explicit, readable controls with visible selected states.

#### Scenario: Toggle event images
- **WHEN** the user toggles the image control
- **THEN** the event cards update to either show or hide event imagery
- **AND** the toggle communicates its current state with visible labels and active styling

#### Scenario: Switch to map view
- **WHEN** the user switches from list view to map view while matching events are available
- **THEN** the application displays a map for matching events with venue coordinates
- **AND** places markers for those events on the map
- **AND** keeps the map toggle understandable through both text and state styling

#### Scenario: No venue coordinates are available
- **WHEN** the user switches to map view but none of the matching events have venue coordinates
- **THEN** the application shows a fallback message indicating that no events with location data are available

## ADDED Requirements

### Requirement: Present home page event cards with a logistics-first hierarchy
The home page SHALL present each event card so date, title, venue, city, format, time, and price are easier to scan than decorative imagery.

#### Scenario: Browse the list on mobile
- **WHEN** the home event list is rendered on a phone-sized viewport
- **THEN** each card emphasizes logistics and format information before optional imagery
- **AND** optional images do not push the core event facts below the first glance of the card

### Requirement: Keep search, empty, and error states readable under the new system
The home page SHALL present search, empty, and error states with strong text contrast and explicit action wording.

#### Scenario: Search or feedback states are shown
- **WHEN** the user encounters the search field, an empty state, or a load error on the home page
- **THEN** labels and instructions remain visible on bright surfaces
- **AND** retry or recovery actions are visually distinct and easy to tap