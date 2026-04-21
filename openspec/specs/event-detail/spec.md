# Capability: Event Detail

## Purpose

Describe how users open a single event, review the main logistics, use location and source-site links, and read the full event description.

## Requirements

### Requirement: Load an event detail page by route id
The event detail page SHALL load a single event based on the numeric id in the route.

#### Scenario: Open a valid event detail route
- **WHEN** the user opens `/event/<id>` with a valid numeric id
- **THEN** the application requests that event from the events API
- **AND** shows a loading state until the request finishes
- **AND** renders the event detail view when the request succeeds

#### Scenario: Open an invalid or unavailable event detail route
- **WHEN** the route id is invalid or the event request fails
- **THEN** the application shows an error state
- **AND** provides a way back to the main event overview

### Requirement: Present the main event logistics prominently
The event detail page SHALL present the core planning information for an event before secondary content, using a logistics-first mobile layout with strong hierarchy and section separation.

#### Scenario: Show main event logistics
- **WHEN** an event detail page loads successfully
- **THEN** the page shows the event title, date, time, venue, and available organizer or pricing information
- **AND** shows category or featured badges when those attributes are available
- **AND** places logistics ahead of long-form description content in the reading order

#### Scenario: Normalize free admission display
- **WHEN** an event cost is stored as `0` or includes the word `frei`
- **THEN** the detail page presents the admission as free rather than as a raw numeric value

### Requirement: Derive extra detail fields from available event content
The event detail page SHALL expose detail fields that can be derived from the event payload.

#### Scenario: Show DJ or workshop information extracted from the description
- **WHEN** the event description contains recognizable DJ or workshop text
- **THEN** the page shows those derived values in the event detail summary

#### Scenario: Use an image fallback from the description
- **WHEN** the event has no dedicated image field but the description contains an image element
- **THEN** the page uses the first description image as the detail image

### Requirement: Show location and outbound actions when available
The event detail page SHALL offer location and source-site actions when the data is available, using touch-friendly action styling and clear section boundaries.

#### Scenario: Show a venue map
- **WHEN** the event includes venue coordinates
- **THEN** the page displays an embedded map with a venue marker
- **AND** provides a link to open the coordinates in an external maps application
- **AND** keeps the location section visually distinct from the descriptive content

#### Scenario: Link to the source event page
- **WHEN** the event detail page is displayed
- **THEN** the page provides a call to action that opens the original event page on the source website in a new tab
- **AND** the outbound action is visually prominent and easy to tap on mobile

### Requirement: Render the event description when present
The event detail page SHALL render the full event description when description content exists.

#### Scenario: Event has a description
- **WHEN** the loaded event includes description content
- **THEN** the detail page renders that description in a dedicated section below the logistics content

### Requirement: Render detail sections with high-contrast reading surfaces
The event detail page SHALL render logistics cards, description content, and outbound actions on bright, high-contrast surfaces appropriate for longer reading by older users.

#### Scenario: Read the detail page for planning
- **WHEN** the user reads an event detail page from top to bottom
- **THEN** section headings, metadata, and description content remain clearly separated
- **AND** the description links remain visibly underlined rather than relying on color alone