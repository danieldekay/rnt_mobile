# Capability: DJ List and Links

## Purpose

Provide a complete, verified DJ browsing experience: correct matching between CPT DJs and event-parsed DJs, accurate link resolution from events to DJ profiles, and rich single-view profiles with city, bio, and style breakdown.

---

## Requirement: DJ CPT-to-event matching is correct

The system SHALL correctly merge CPT DJ entries with DJ names parsed from event descriptions, using the canonical WordPress slug as the primary matching key.

### Scenario: CPT DJ with matching event-parsed name
- **GIVEN** a CPT DJ entry with `slug: "leilani-weiss"` and `name: "Leilani Weiss"`
- **AND** an event whose description contains "DJ Leilani Weiss"
- **WHEN** `getDjsFromCptAndEvents()` processes the CPT list and events
- **THEN** the event data SHALL be merged into the CPT DJ entry with `slug: "leilani-weiss"`
- **AND** the resulting `DjProfileSummary.slug` SHALL be `"leilani-weiss"` (the CPT slug)

### Scenario: Event-parsed DJ without matching CPT entry
- **GIVEN** an event whose description contains "DJ SomeNewName"
- **AND** no CPT DJ entry exists for "SomeNewName"
- **WHEN** `getDjsFromCptAndEvents()` processes the data
- **THEN** a new `DjProfileSummary` SHALL be created with `slug` set to the computed `getDjSlug("SomeNewName")`

### Scenario: CPT DJ with zero events in window
- **GIVEN** a CPT DJ entry with `slug: "leilani-weiss"`
- **AND** no events in the loaded window mention "Leilani Weiss"
- **WHEN** `getDjsFromCptAndEvents()` processes the data
- **THEN** the CPT DJ SHALL still appear in the result with `upcomingCount: 0` and `countsByDateFilter` all zeros

---

## Requirement: DJ link from event detail resolves correctly

The event detail page SHALL link to the correct DJ profile using the canonical CPT slug when available, falling back to the computed slug.

### Scenario: DJ name matches a CPT entry
- **GIVEN** an event whose description contains "DJ Leilani Weiss"
- **AND** a CPT DJ entry exists with `slug: "leilani-weiss"`
- **WHEN** the event detail page renders the DJ link
- **THEN** the link href SHALL be `/djs/leilani-weiss`

### Scenario: DJ name does not match any CPT entry
- **GIVEN** an event whose description contains "DJ SomeNewName"
- **AND** no CPT DJ entry exists for "SomeNewName"
- **WHEN** the event detail page renders the DJ link
- **THEN** the link href SHALL be `/djs/<computed-slug>` using `getDjSlug("SomeNewName")`

### Scenario: No DJ in event
- **GIVEN** an event whose description does not mention any DJ
- **WHEN** the event detail page renders
- **THEN** no DJ section SHALL be shown in the sidebar or detail section

---

## Requirement: DJ single view shows rich profile

The DJ single view (`/djs/[slug]`) SHALL display name, style, upcoming count, city (when available), a derived bio, and a style breakdown.

### Scenario: DJ has events with city data
- **GIVEN** a DJ profile with events in multiple cities
- **WHEN** the DJ single view loads
- **THEN** the most common city among the DJ's events SHALL be displayed as a badge
- **AND** the city badge SHALL show "Nächster Ort: {city}"

### Scenario: DJ has no events
- **GIVEN** a DJ profile with `upcomingCount: 0`
- **WHEN** the DJ single view loads
- **THEN** the page SHALL show "Aktuell keine verknüpften Termine"
- **AND** no city badge SHALL be shown

### Scenario: DJ has style breakdown
- **GIVEN** a DJ profile with `styleCounts.traditional: 3`, `styleCounts.neo: 1`, `styleCounts.mixed: 0`
- **WHEN** the DJ single view loads
- **THEN** the style breakdown SHALL show "Traditionell 3 · Neo 1"
- **AND** "Gemischt" SHALL be omitted because its count is 0

### Scenario: DJ has a derived bio
- **GIVEN** a DJ profile with associated events that have descriptions
- **WHEN** the DJ single view loads
- **THEN** a bio section SHALL be shown with a concatenation of unique, truncated event descriptions
- **AND** the bio SHALL be limited to approximately 300 characters

---

## Requirement: DJ parsing covers titles, excerpts, and multiple DJs

The system SHALL extract DJ names from event titles, excerpts, and descriptions, and SHALL support multiple DJs per event.

### Scenario: DJ mentioned in event title
- **GIVEN** an event with title "Milonga mit DJ Leilani Weiss"
- **WHEN** `extractDjFromDescription()` is called
- **THEN** it SHALL return "Leilani Weiss"

### Scenario: DJ mentioned in event excerpt
- **GIVEN** an event with excerpt containing "DJ: Max Mustermann"
- **WHEN** `extractDjFromDescription()` is called
- **THEN** it SHALL return "Max Mustermann"

### Scenario: Multiple DJs in one event
- **GIVEN** an event with description "DJs: Leilani Weiss & Max Mustermann"
- **WHEN** `extractAllDjsFromEvent()` is called
- **THEN** it SHALL return `["Leilani Weiss", "Max Mustermann"]`
- **WHEN** `extractDjFromDescription()` is called
- **THEN** it SHALL return "Leilani Weiss" (the first match, for backward compatibility)

### Scenario: No DJ in event
- **GIVEN** an event with no DJ mention in title, excerpt, or description
- **WHEN** `extractDjFromDescription()` is called
- **THEN** it SHALL return `null`

---

## Requirement: DJ list page shows city and zero-event state

The DJ list page SHALL display city information per DJ card and clearly indicate DJs with no upcoming events.

### Scenario: DJ card with city
- **GIVEN** a DJ with `nextEventCity: "Heidelberg"`
- **WHEN** the DJ list page renders
- **THEN** the card SHALL show "Heidelberg" in the next-event meta line

### Scenario: DJ card without city
- **GIVEN** a DJ with `nextEventCity: ""`
- **WHEN** the DJ list page renders
- **THEN** the card SHALL show "Kein Termin im Zeitraum" instead of a city

### Scenario: DJ with zero upcoming events
- **GIVEN** a DJ with `upcomingCount: 0`
- **WHEN** the DJ list page renders
- **THEN** the upcoming count badge SHALL show "Keine Termine"
- **AND** the badge SHALL use a muted visual style (e.g., `text-text-muted` instead of the default badge style)