# Tasks

## Prerequisites

- [x] `desktop-layout-foundation` applied.

---

## Task List

- [x] T1 Add `selectedDay` state and reuse the existing day-select handler in `src/routes/kalender/+page.svelte`; validate with `npm run check`.
- [x] T2 Create `src/lib/components/AgendaPanel.svelte` with `events` and `heading` props, a compact agenda list, and the empty state "Keine Veranstaltungen".
- [x] T3 Thread a `{#snippet rightSidebar()}` agenda in `src/routes/kalender/+page.svelte` for selected-day or next-7-days events while keeping the selector and inline event list mobile-only; validate with `npm run check`.
- [x] T4 Perform the desktop/mobile visual smoke test and run `npm run build`.
