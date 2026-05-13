# Desktop Calendar Spec

## Capability: `desktop-calendar`

### Summary

Enhanced `/kalender` route for desktop with full-width month grid and right-sidebar agenda panel showing selected day or upcoming week events.

---

## ADDED Requirements

### Desktop Sidebar Agenda Panel

#### Scenario: Display selected day events
- User clicks a day on the calendar grid
- Right sidebar displays heading with selected date
- All events for that day listed below with time and title
- Each event links to `/event/[slug]`
- Sidebar updates immediately when user selects different day

#### Scenario: Display upcoming week when no day selected
- On initial page load, no day is selected
- Right sidebar displays heading "Nächste 7 Tage"
- Events from next 7 days listed chronologically
- Each event shows date, time, and title
- Links to event detail page

#### Scenario: Calendar grid expands on desktop
- Calendar component renders at full available width in main column
- Grid cells larger than mobile to accommodate sidebar
- All calendar navigation and selection remains functional
- Mobile layout unchanged (single column, compact cells)

### Files Added
- `src/lib/components/AgendaPanel.svelte` (optional - day/week event list component)

## MODIFIED Requirements

### Calendar Page Enhancement

#### Scenario: Integrate agenda sidebar
- File `src/routes/kalender/+page.svelte` updated to use `DesktopLayout`
- Wraps `Calendar` component in main column
- Adds `AgendaPanel` to right sidebar
- Manages `selectedDay` state
- Passes selected day to `AgendaPanel` for rendering

#### Scenario: State management
- Component maintains `selectedDay: Date | null` state
- Calendar emits `onDaySelect` event when user clicks day
- Selected day state updates sidebar immediately
- No changes to calendar internal logic or event store

### Files Modified
- `src/routes/kalender/+page.svelte` (add sidebar layout and agenda panel)

---

### Behaviour

#### Calendar Grid (main column)

- Month grid displays at full available width
- Grid cells larger on desktop vs mobile
- Day selection functionality unchanged
- All calendar navigation controls work as before

#### Sidebar Agenda (desktop only)

- Shows events for selected day with time and title
- Or shows 7-day upcoming agenda if no day selected
- Event titles link to event detail page
- Updates immediately on day selection

#### Mobile

- Single-column layout unchanged
- Calendar displays at mobile-optimized width
- No right sidebar
- All existing mobile behaviour preserved

---

### States

| State | Behaviour |
|---|---|
| Day selected | Sidebar shows events for that day |
| No day selected | Sidebar shows next 7 days of events |
| Loading | Skeleton cards in sidebar |
| No events for day | "Keine Veranstaltungen" message |
