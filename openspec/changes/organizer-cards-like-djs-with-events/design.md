## Context

The RNT Kalender app displays three main entity types: DJs, Organizers, and Venues. Currently, DJ cards show upcoming events with date, title, and location, but OrganizerCard and VenueCard lack this event preview functionality. Users have requested a consistent browsing experience where they can see what's happening next for each organizer/venue directly from the card.

The existing DJ card implementation uses `DjProfileSummary.nextEventsByDateFilter` to display the next event. The `DjNextEventSummary` type includes `internalPath`, `externalUrl`, `title`, `dateLabel`, and `city`.

## Goals / Non-Goals

**Goals:**
- OrganizerCard displays up to 2 upcoming events with consistent styling to DJ cards
- Each event preview shows date, title (linked), and city
- "Keine Termine" message when no upcoming events
- Card layout matches DJ card width, spacing, and interaction patterns
- Style/genre indicator badge similar to DJ style badges

**Non-Goals:**
- Changing the underlying data fetching mechanism
- Adding new API endpoints
- Modifying VenueCard to show a specific number of events (just count and next event info)

## Decisions

### 1. Event Data Structure
**Decision**: Add `nextEvents` array to organizer/venue types
**Rationale**: The DJ pattern uses `DjNextEventSummary` for individual events. We'll create a similar structure for organizers with `OrganizerNextEventSummary`.
**Alternative Considered**: Using full event objects - rejected as overkill for card display where we only need title, date, city, and link.

### 2. Card Layout Pattern
**Decision**: Follow DJ card structure exactly
- Avatar/image area (14x14 for organizer, no avatar for venue)
- Name with link to detail page
- Border-top separator before events
- Event entries with calendar icon, title link, date/city info
**Rationale**: Consistency reduces cognitive load and maintains design system integrity.

### 3. Event Preview Count
**Decision**: Show 2 events for OrganizerCard, 1 for VenueCard
**Rationale**: Organizers run multiple events (milongas, practicas, workshops), so showing 2 gives better context. Venues host events but showing 1 keeps the card compact.

### 4. No Avatar for Venues
**Decision**: VenueCard will not show an avatar circle
**Rationale**: Venues don't need profile images in the list view; the venue name is sufficient. Logo if available can be shown in the detail view.

## Risks / Trade-offs

- **Risk**: Layout shifts if event titles are very long
  - **Mitigation**: Use `line-clamp-2` utility to limit text to 2 lines
  
- **Risk**: Missing event data for some organizers/venues
  - **Mitigation**: Graceful fallback to "Keine Termine" message

- **Risk**: Performance impact if many cards rendered with event data
  - **Mitigation**: Data is already fetched for the page; no additional requests needed