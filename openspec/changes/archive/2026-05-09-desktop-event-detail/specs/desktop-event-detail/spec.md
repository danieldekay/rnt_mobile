# Desktop Event Detail Spec

## Capability: `desktop-event-detail`

### Summary

On desktop, event detail page shows description + image in main column and a sticky metadata panel (date, venue, organiser, CTA) in the right sidebar. Mobile unchanged.

---

## MODIFIED Requirements

#### Scenario: Apply two-pane layout to event detail page

- File: `src/routes/event/[slug]/+page.svelte`
- Integrate `DesktopLayout` component on desktop (≥ 1024 px)
- Main column contains hero image, title, description, and badge chips
- Right sidebar displays metadata: date, time, venue, organiser, CTA button
- Sidebar is sticky (`position: sticky; top: 1.5rem`)

#### Scenario: Display event content in main column

- File: `src/routes/event/[slug]/+page.svelte`
- Hero image at top (if present)
- Event title (h1)
- Description (sanitised HTML)
- Event-type and music-type badge chips

#### Scenario: Display metadata panel in sidebar

- File: `src/routes/event/[slug]/+page.svelte`
- Date and time formatted in German locale
- Venue name with optional link to venue detail or Google Maps
- Organiser/Veranstalter name with optional link to organiser detail
- Primary button for registration or ticket link ("Zur Anmeldung" / "Tickets")
- Event-type and music-type badges (duplicate for quick scan)
- Optional: Extract into `EventMetaPanel.svelte` component

---

### Behaviour

#### Main Column

- Event hero image (if present) at top.
- Event title (h1).
- Description (sanitised HTML).
- Event-type and music-type badge chips.

#### Right Sidebar (desktop)

- Date and time of event (formatted in German locale).
- Venue name (links to venue detail if available, or Google Maps).
- Organiser / Veranstalter name (links to organiser detail if available).
- Registration or ticket link rendered as a teal primary button ("Zur Anmeldung" / "Tickets").
- Event-type and music-type badges (duplicate from main, for quick scan).
- Sticky: `position: sticky; top: 1.5rem`.

#### Mobile (< 1024 px)

No change.

---

### States

| State | Behaviour |
|---|---|
| No image | Main column starts with title |
| No ticket/registration URL | CTA button not rendered |
| No venue | Venue line not rendered |
| Loading | Existing skeleton/spinner |
| 404 / error | Existing error page |
