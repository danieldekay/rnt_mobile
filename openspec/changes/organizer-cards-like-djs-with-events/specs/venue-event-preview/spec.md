## ADDED Requirements

### Requirement: Display next event info on venue card
The VenueCard component SHALL display the next upcoming event with date, title, and city.

#### Scenario: Venue has upcoming event
- **WHEN** a venue has an upcoming event
- **THEN** the card displays the event title, date, and city

#### Scenario: Venue has no upcoming events
- **WHEN** a venue has no upcoming events
- **THEN** the card shows "Kein Termin geplant" message

### Requirement: Display event count on venue card
The VenueCard SHALL display the total count of upcoming events for the venue.

#### Scenario: Multiple upcoming events
- **WHEN** a venue has 3 upcoming events
- **THEN** the card shows "3 Termine" near the event preview

### Requirement: No avatar on venue card
The VenueCard SHALL NOT display an avatar circle for the venue.

#### Scenario: Venue card structure
- **WHEN** viewing the venue card
- **THEN** the card starts with venue name and information without an avatar element

### Requirement: Event title links to event page
The event title on the venue card SHALL link to the event detail page.

#### Scenario: Venue event has internal path
- **WHEN** the venue's next event has an internal path
- **THEN** clicking the title navigates to /event/{id}