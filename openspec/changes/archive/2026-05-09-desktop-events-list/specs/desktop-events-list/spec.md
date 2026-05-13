# Desktop Events List Spec

## Capability: `desktop-events-list`

### Summary

On desktop (≥ 1024 px), the events list page renders event cards in a two-column grid and moves filter controls into the right sidebar. Mobile layout is unchanged.

---

## MODIFIED Requirements

#### Scenario: Render multi-column event card grid on desktop

- File: `src/routes/+page.svelte`
- Desktop (≥ 1024 px): Event cards render in two-column grid (`grid grid-cols-2 gap-4`)
- Mobile (< 1024 px): Single-column layout unchanged
- Existing `EventCard` component reused without modification
- Empty, loading, and error states remain centered and span full grid width

#### Scenario: Display filter panel in right sidebar

- File: `src/routes/+page.svelte`
- Right sidebar contains: `DateFilter`, event-type `FilterChip` row, music-type `MusicFilterChip` row
- Below filters: event count display (e.g. "12 Veranstaltungen")
- Sidebar visible only on desktop (≥ 1024 px)
- Filters remain on mobile inline above cards (no changes to mobile)

#### Scenario: Filters remain reactive in sidebar

- File: `src/routes/+page.svelte`
- Selecting filter chips immediately updates card grid
- Event count in sidebar updates reactively
- No new API endpoints or store changes required

---

### Behaviour

#### Card Grid (desktop)

- Event cards render in a `grid grid-cols-2 gap-4` container.
- Existing `EventCard` component is used without modification.
- Empty state, loading state, and error state maintain their existing appearance but centred within the grid column span.

#### Right Sidebar (desktop)

- Contains: `DateFilter`, event-type `FilterChip` row, music-type `MusicFilterChip` row.
- Below filters: count of currently displayed events (e.g. "12 Veranstaltungen").
- Filters remain reactive — selecting chips immediately filters the card grid.

#### Mobile (< 1024 px)

- No change from current behaviour.

---

### States

| State | Desktop behaviour |
|---|---|
| Loading | Full-width skeleton or spinner spans both columns |
| Empty | "Keine Veranstaltungen gefunden" centred, spanning both columns |
| Error | Existing error message, spanning both columns |
| Filtered | Grid updates reactively; count in sidebar updates |

---

### Responsive Notes

- Filter chips visible in sidebar on desktop; in-line on mobile.
- `DateFilter` visible in sidebar on desktop; inline above cards on mobile.
