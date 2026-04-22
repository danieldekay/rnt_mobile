## MODIFIED Requirements

### Requirement: Show location and outbound actions when available
The event detail page SHALL offer location and source-site actions when the data is available, using touch-friendly action styling and clear section boundaries, and SHALL require explicit map consent before loading the embedded venue map.

#### Scenario: Show a venue map after consent
- **WHEN** the event includes venue coordinates and map consent has been granted
- **THEN** the page displays an embedded map with a venue marker
- **AND** provides a link to open the coordinates in an external maps application
- **AND** keeps the location section visually distinct from the descriptive content

#### Scenario: Withhold the embedded map until consent
- **WHEN** the event includes venue coordinates but map consent has not been granted
- **THEN** the page shows a placeholder explaining that the embedded map uses an external map service
- **AND** provides an explicit action to enable maps for the app
- **AND** keeps the manual outbound map link available as a separate user-initiated action

#### Scenario: Link to the source event page
- **WHEN** the event detail page is displayed
- **THEN** the page provides a call to action that opens the original event page on the source website in a new tab
- **AND** the outbound action is visually prominent and easy to tap on mobile