# Capability: Home Event Browsing

## Purpose

Describe how users browse upcoming tango events from the home page, including loading, narrowing results, switching presentation modes, and understanding empty or error states.

## Requirements

### Requirement: Load a default event list on the home page
The home page SHALL load tango events when the user opens `/`, using the current default date filter and showing load progress until the first response arrives.

#### Scenario: Initial load succeeds
- **WHEN** the user opens the home page
- **THEN** the application requests events for the default date filter
- **AND** shows a loading indicator while no events are available yet
- **AND** renders the fetched events as tappable event cards when the request succeeds

#### Scenario: Initial load fails
- **WHEN** the event request fails during the initial home page load
- **THEN** the application shows an error state
- **AND** provides a retry action to load the events again

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

### Requirement: Let users search within the currently loaded results
The home page SHALL support client-side search over the currently loaded event list.

#### Scenario: Search the loaded results
- **WHEN** the user enters a search query
- **THEN** the application filters the loaded events by title, venue, city, description, organizer, and extracted DJ text
- **AND** shows only the matching events in the list

#### Scenario: Clear the search query
- **WHEN** the user clears the active search query
- **THEN** the application restores the full currently loaded event list

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
- **WHEN** the user switches to map view but none of the matching events have venue coordinates
- **THEN** the application shows a fallback message indicating that no events with location data are available

### Requirement: Communicate empty and refresh states clearly
The home page SHALL communicate when no matches remain and SHALL allow the user to refresh the loaded events manually.

#### Scenario: No events match the current filters
- **WHEN** the current filters and search query produce no matching events
- **THEN** the application shows an empty state explaining that no events were found

#### Scenario: Refresh the event list manually
- **WHEN** the user triggers the refresh action
- **THEN** the application reloads the event list from the API
- **AND** shows a loading indication while the refresh is in progress

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