# Desktop Veranstalter Spec

## Capability: `desktop-veranstalter`

### Summary

New `/veranstalter` route showing all event organisers. Desktop: two-column card grid with city filter sidebar. Mobile: single-column list.

---

## ADDED Requirements

### Veranstalter (Organisers) Directory

#### Scenario: Load organizers page
- Route `/veranstalter` is accessible and fetches organizer data from API
- Page title displays "Veranstalter" in main content area
- Loading state shows skeleton cards
- Page is prerendered at build time

#### Scenario: Display organizer cards (2-column grid on desktop, 1-column mobile)
- On desktop (≥ 1024 px), organizer cards are displayed in a two-column grid
- On mobile (< 1024 px), organizer cards are displayed in a single-column list
- Each card shows: photo/logo, name, city/region, website link, and number of events
- Empty state: "Keine Veranstalter gefunden" is shown if no organizers are available
- Error state: "Veranstalter konnten nicht geladen werden" is shown on API failure

#### Scenario: Filter by city/region
- Right sidebar on desktop displays city/region filter chips derived from organizer data
- Clicking a filter updates the grid to show only organizers from that city/region
- Sidebar displays the count of shown organizers
- Sidebar is hidden on mobile
- Filters are client-side; no additional API calls required

### Files Added
- `src/routes/veranstalter/+page.ts` — load function fetching organizer data
- `src/routes/veranstalter/+page.svelte` — page component with organizer grid and city/region filter sidebar

## MODIFIED Requirements

### API Organizer Data Enhancement

#### Scenario: API provides organizer data with city/region field
- `fetchOrganizers()` returns organizers with all required fields: name, photo/logo, city, region, website, event count
- Data structure supports filtering and display requirements
- Function handles API errors gracefully
- Coordinate with desktop-djs spec to ensure consistent organizer data handling

#### Scenario: Type definitions support organizer structure
- Organizer type in `src/lib/types.ts` includes all required fields
- City/region field is available for filtering
- Photo/logo URL available for display

### Files Modified
- `src/lib/api/tribe.ts` — add or enhance `fetchOrganizers()` function
- `src/lib/types.ts` — confirm organizer type includes city, region, photo, website, and event count fields

---

### Behaviour

#### Organiser Card

- Photo / logo
- Name
- City / region (if available)
- Website link
- Number of events

#### Right Sidebar (desktop)

- City / region filter chips (derived from organiser data)
- Count of shown organisers
- Sidebar is sticky and remains visible while scrolling main column

#### Mobile

Single-column list without sidebar.

---

### States

| State | Behaviour |
|---|---|
| Loading | Skeleton cards |
| Empty | "Keine Veranstalter gefunden" |
| API error | "Veranstalter konnten nicht geladen werden" |
| City filter active | Grid updates; count updates |
