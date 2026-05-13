# Capability: fetch-organizer-events-api

## ADDED Requirements

### Requirement: Fetch events filtered by organizer ID
The API module SHALL provide a function to fetch events for a specific organizer by their WordPress organizer ID, returning only events belonging to that organizer.

#### Scenario: Fetch events for an existing organizer
- **WHEN** `fetchOrganizerEvents(organizerId, fetch)` is called with a valid organizer ID
- **THEN** the function makes a single API request to `/wp-json/tribe/events/v1/events?organizer=<id>`
- **AND** returns an array of TribeEvent objects for that organizer
- **AND** the result is sorted by start_date ascending

#### Scenario: No events for organizer
- **WHEN** `fetchOrganizerEvents(organizerId, fetch)` is called for an organizer with no upcoming events
- **THEN** the function returns an empty array
- **AND** does not throw an error

#### Scenario: API returns error status
- **WHEN** the WordPress API returns a non-2xx status for an organizer events request
- **THEN** the function throws an EventFetchError with the appropriate status
- **AND** the error message is suitable for user display

#### Scenario: Network failure during fetch
- **WHEN** the network request to the organizer events endpoint fails
- **THEN** the function throws an EventFetchError
- **AND** the error status is 0 or undefined
