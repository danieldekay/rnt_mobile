# RNT Mobile TangoAtlas consumer and editor requirements

## Requirement: API-backed event discovery
The RNT Mobile client SHALL render public eligible events and their concrete occurrences from TangoAtlas's documented generic portal API using its existing list/calendar/detail and filtering experience.

### Scenario: Recurring events
- **GIVEN** a published recurring weekly milonga with one cancelled and one rescheduled date
- **WHEN** the mobile calendar requests a bounded range
- **THEN** the relevant occurrences render once, with stable IDs and correct times, cancellation semantics and links to the canonical venue, organizer and DJ.

### Scenario: Provider isolation
- **GIVEN** the local application configured for TangoAtlas
- **WHEN** its event list, calendar and details load
- **THEN** no requests to the WordPress Tribe Events API are made; production configuration remains unchanged until approved.

## Requirement: TangoAtlas-authorized editing
The RNT Mobile client SHALL expose edit/propose-correction affordances for an Authentik-authenticated user only in accordance with TangoAtlas-reported per-event permissions.

### Scenario: Owner submits a correction
- **GIVEN** organizer A is signed in and authorized for an event
- **WHEN** they submit a corrected start time
- **THEN** the client relays the change through the approved write API with revision protection and clearly reports published vs pending moderation status.

### Scenario: Unauthorized actor
- **GIVEN** organizer B or an anonymous visitor
- **WHEN** they attempt the same edit
- **THEN** TangoAtlas denies the request and the client displays the correct reason without overwriting the record.

### Scenario: Stale revision or expired session
- **GIVEN** a stale edit form or expired session
- **WHEN** the user submits
- **THEN** the client preserves unsaved work and shows recovery options rather than blindly resubmitting or claiming success.
