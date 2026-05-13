# Desktop Venues Spec

## Capability: `desktop-venues`

### Summary

New `/tanzraeume` route showing tango venues from the Tribe Events API. Desktop: two-column card grid with city filter sidebar. Mobile: single-column list.

---

## ADDED Requirements

### Tanzräume (Venues) Directory

#### Scenario: Load venues page
- Route `/tanzraeume` is accessible and fetches venue data from Tribe Events API
- Page title displays "Tanzräume" in main content area
- Loading state shows skeleton cards
- Page is prerendered at build time

#### Scenario: Display venue cards (2-column grid on desktop, 1-column mobile)
- On desktop (≥ 1024 px), venue cards are displayed in a two-column grid
- On mobile (< 1024 px), venue cards are displayed in a single-column list
- Each card shows: venue name, address, Google Maps link (if coordinates available), and upcoming event count
- Empty state: "Keine Tanzräume gefunden" is shown if no venues are available
- Error state: "Tanzräume konnten nicht geladen werden" is shown on API failure

#### Scenario: Filter by city/location
- Right sidebar on desktop displays city filter chips derived from `venue.city` values
- Clicking a city filter updates the grid to show only venues from that city
- Sidebar displays the count of shown venues
- Sidebar is hidden on mobile
- Filters are client-side; no additional API calls required

### Files Added
- `src/routes/tanzraeume/+page.ts` — load function fetching venue data
- `src/routes/tanzraeume/+page.svelte` — page component with venue grid and city filter sidebar

## MODIFIED Requirements

### API Venue Data Enhancement

#### Scenario: API provides venue data with city field
- `fetchVenues()` returns venues with all required fields: name, address, city, coordinates (for maps), event count
- Data structure supports filtering and display requirements
- Function handles API errors gracefully

#### Scenario: Type definitions support venue structure
- `TribeVenue` type in `src/lib/types.ts` includes all venue fields
- City field is available for filtering
- Coordinates field available for mapping

### Files Modified
- `src/lib/api/tribe.ts` — add or enhance `fetchVenues()` function
- `src/lib/types.ts` — ensure `TribeVenue` type includes city and other required fields

---

### Behaviour

#### Venue Card

- Venue name
- Address (street + city)
- Google Maps link if coordinates available
- Upcoming event count

#### Right Sidebar (desktop)

- City filter chips derived from `venue.city` values
- Count of shown venues
- Sidebar is sticky and remains visible while scrolling main column

#### Mobile

Single-column list without sidebar.

---

### States

| State | Behaviour |
|---|---|
| Loading | Skeleton cards |
| Empty | "Keine Tanzräume gefunden" |
| API error | "Tanzräume konnten nicht geladen werden" |
| City filter active | Grid updates; count updates |
