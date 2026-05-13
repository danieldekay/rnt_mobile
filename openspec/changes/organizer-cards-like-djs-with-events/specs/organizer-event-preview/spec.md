## ADDED Requirements

### Requirement: Display next 2 events on organizer card
The OrganizerCard component SHALL display up to 2 upcoming events when available.

#### Scenario: Organizer has upcoming events
- **WHEN** an organizer has 2 or more upcoming events
- **THEN** the card displays event previews for the next 2 events

#### Scenario: Organizer has 1 upcoming event
- **WHEN** an organizer has exactly 1 upcoming event
- **THEN** the card displays only that 1 event preview

#### Scenario: Organizer has no upcoming events
- **WHEN** an organizer has no upcoming events
- **THEN** the card displays "Keine Termine im gewählten Zeitraum" message

### Requirement: Event preview shows date, title, and city
Each event preview SHALL display the event date, title (linked), and city in the same format as DJ cards.

#### Scenario: Event with all information
- **WHEN** an event has date, title, and city available
- **THEN** the preview shows all three pieces of information

#### Scenario: Event without city
- **WHEN** an event has no city information
- **THEN** only the date and title are displayed

### Requirement: Event title links to event page
The event title SHALL link to the event detail page using the internal path or external URL.

#### Scenario: Event has internal path
- **WHEN** an event has an internal path
- **THEN** clicking the title navigates to /event/{id}

#### Scenario: Event has external URL only
- **WHEN** an event has an external URL but no internal path
- **THEN** clicking the title opens the external URL in a new tab

## MODIFIED Requirements

### Requirement: Card layout consistency with DJ cards
The OrganizerCard layout SHALL match the DJ card structure with avatar, name, and event previews section.

#### Scenario: Desktop layout
- **WHEN** viewing on desktop (768px+)
- **THEN** cards display in a grid with consistent spacing

#### Scenario: Mobile layout
- **WHEN** viewing on mobile (767px and below)
- **THEN** cards stack vertically with adequate tap targets

### Requirement: Style indicator badge
The OrganizerCard SHALL display a style/genre indicator badge similar to the DJ style badge.

#### Scenario: Organizer with known style
- **WHEN** an organizer has music style information
- **THEN** a badge shows the primary style abbreviation

#### Scenario: Organizer without style
- **WHEN** an organizer has no style information
- **THEN** no style badge is displayed