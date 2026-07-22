# Delta: home-event-browsing

## MODIFIED Requirements

### Requirement: Present home page event cards with a logistics-first hierarchy

The home page SHALL present each event card so date, title, venue, city, format, time, and price are easier to scan than decorative imagery while still surfacing a compact set of optional event-detail markers.

#### Scenario: Browse the list on mobile

- **WHEN** the home event list is rendered on a phone-sized viewport
- **THEN** each card emphasizes logistics and format information before optional imagery
- **AND** optional images do not push the core event facts below the first glance of the card
- **AND** any supplemental event-detail markers appear in a visually secondary area that does not break the card's fast scan path

#### Scenario: Recognized event highlights are visible in the home list

- **WHEN** a listed home-page event includes recognized highlight metadata such as live music or show
- **THEN** the card displays those markers directly in the list
- **AND** the markers remain readable on mobile without competing with the title, venue, or time information
