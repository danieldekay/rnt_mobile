# Desktop DJs Spec

## Capability: `desktop-djs`

### Summary

New `/djs` route showing organisers who are DJs (filtered from Tribe organizers or all organizers). Desktop: three-column card grid with style-filter sidebar. Mobile: single-column list.

---

## ADDED Requirements

#### Scenario: Create DJs route

- New route `/djs` in `src/routes/djs/+page.ts` and `src/routes/djs/+page.svelte`
- Fetches organizers from Tribe API via `fetchOrganizers()`
- Renders DJ cards in responsive grid layout

#### Scenario: Display DJ cards (3-column grid on desktop, 1-column mobile)

- Desktop (≥ 1024 px): Three-column grid with DJ cards
- Mobile (< 1024 px): Single-column list
- Each card displays photo/avatar, name, and "Events ansehen" link

#### Scenario: Filter DJs by music style/type

- Right sidebar on desktop contains music-style filter chips: Traditionell, Neo, 50/50, Gemischt
- Filters are reactive and update displayed DJ count
- Sidebar hidden on mobile

---

## MODIFIED Requirements

#### Scenario: Enhance Tribe API organizer fetch

- File: `src/lib/api/tribe.ts`
- Add or confirm `fetchOrganizers()` function to retrieve all organizers from Tribe API
- Returns array of `TribeOrganizer` objects

#### Scenario: Confirm organizer type definitions

- File: `src/lib/types.ts`
- Ensure `TribeOrganizer` type includes: `id`, `name`, `photo` (or avatar URL), and optional `music_style` field
- Confirm compatibility with API response structure

---

### Behaviour

#### DJ Card

- Photo / avatar.
- Name.
- "Events ansehen" link.

#### Right Sidebar (desktop)

- Music-style filter chips: Traditionell, Neo, 50/50, Gemischt.
- Count of shown DJs.

#### Mobile

Single-column list.

---

### States

| State | Behaviour |
|---|---|
| Loading | Skeleton cards |
| Empty | "Keine DJs gefunden" |
| API error | "DJs konnten nicht geladen werden" |

---

### Open Question

If the Tribe API does not distinguish DJs from other organizers, this page shows all organizers and the implementation team decides whether to rename or merge with `desktop-veranstalter`.
