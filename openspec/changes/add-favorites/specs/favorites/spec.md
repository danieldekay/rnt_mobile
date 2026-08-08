# Favorites Specification

## Requirement: Durable local storage

The app SHALL persist favorites under `rnt-favorites` in `localStorage` and restore them on reload and after app updates.

#### Scenario: Reload restores favorites

- **WHEN** the user favorites an organizer and reloads the page
- **THEN** the organizer remains favorited

#### Scenario: Corrupt storage falls back safely

- **WHEN** `rnt-favorites` contains invalid JSON
- **THEN** the app uses empty favorites without crashing

## Requirement: Event favorite scopes

The user SHALL be able to favorite an event as a single occurrence or as a series (all occurrences with the same slug).

#### Scenario: Single occurrence favorite

- **WHEN** the user chooses “Nur diesen Termin”
- **THEN** only that event id is stored

#### Scenario: Series favorite

- **WHEN** the user chooses “Alle Termine dieser Reihe”
- **THEN** the event slug is stored and all occurrences match

## Requirement: Entity favorites

The user SHALL be able to favorite organizers, venues, and DJs independently.

## Requirement: Upcoming favorites view

The app SHALL show upcoming events that match any favorite (event, series, organizer, venue, or DJ) on `/favoriten` and via the home favorites filter chip.

#### Scenario: Organizer-linked match

- **WHEN** an organizer is favorited
- **THEN** upcoming events with that organizer appear in favorites views

#### Scenario: Empty favorites

- **WHEN** the user has no favorites
- **THEN** `/favoriten` shows a helpful empty state
