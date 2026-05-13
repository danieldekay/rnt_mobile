## MODIFIED Requirements

### Requirement: Support list-level presentation toggles
The home page SHALL allow the user to switch image visibility and switch between list and map presentation using explicit, readable controls with visible selected states, and SHALL require explicit map consent before any embedded map tiles are requested.

#### Scenario: Toggle event images
- **WHEN** the user toggles the image control
- **THEN** the event cards update to either show or hide event imagery
- **AND** the toggle communicates its current state with visible labels and active styling

#### Scenario: Switch to map view after consent
- **WHEN** the user switches from list view to map view while matching events are available and map consent has already been granted
- **THEN** the application displays a map for matching events with venue coordinates
- **AND** places markers for those events on the map
- **AND** keeps the map toggle understandable through both text and state styling

#### Scenario: Switch to map view without map consent
- **WHEN** the user switches from list view to map view before granting map consent
- **THEN** the application shows a consent placeholder instead of the embedded map
- **AND** explains that enabling the map sends requests to an external map service
- **AND** provides an explicit action to enable maps

#### Scenario: No venue coordinates are available
- **WHEN** the user switches to map view, map consent has been granted, but none of the matching events have venue coordinates
- **THEN** the application shows a fallback message indicating that no events with location data are available