## Design

### Overview

Targeted update to `src/routes/kalender/+page.svelte`. The `Calendar` component renders in the main column at full available width; the right sidebar shows events for the selected day or the next 7 days if no day is selected.

### Affected Files

| File | Change type | Notes |
|---|---|---|
| `src/routes/kalender/+page.svelte` | Edit | Add right-sidebar agenda panel |
| `src/lib/components/AgendaPanel.svelte` | New (optional) | Day/week event list for right sidebar |

### Desktop Layout Structure

```
DesktopLayout
  main:
    heading "Kalender"
    <Calendar /> (full width, larger cells)
  rightSidebar:
    heading: selected date or "Nächste 7 Tage"
    list of event titles + times for that day/week
    each item links to /event/[slug]
```

### State Logic

- `selectedDay: Date | null` — $state in the page; `Calendar` emits `onDaySelect`.
- When `selectedDay` is set: sidebar shows events matching that date.
- When `selectedDay` is null: sidebar shows events in the next 7 days from today.

### Design Token Usage

Same as foundation — no new tokens.

### Validation

```bash
npm run check
npm run build
```
