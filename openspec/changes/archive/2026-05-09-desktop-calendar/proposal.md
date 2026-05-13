## Why

The calendar page (`/kalender`) renders a compact month grid that works well on mobile but leaves significant desktop width unused. On desktop, the available horizontal space can show the full month grid alongside a day-detail panel or agenda strip in the right sidebar, giving users a much richer calendar-browsing experience.

## What Changes

- Update `src/routes/kalender/+page.svelte` to use `DesktopLayout`'s `rightSidebar` on desktop.
- The `Calendar.svelte` component is displayed at its natural width in the main column (larger on desktop).
- Right sidebar shows: selected-day event list, or upcoming-week agenda strip when no day is selected.
- No changes to `Calendar.svelte` internals, store logic, API, or mobile layout.

## Capabilities

### New Capabilities

- `desktop-calendar`: Desktop calendar view — full-width month grid with right-sidebar day/week agenda panel; mobile unchanged.

### Modified Capabilities

- `calendar-browsing`: Desktop rendering added; mobile behaviour and data contract unchanged.

## Impact

- **Files changed**: `src/routes/kalender/+page.svelte`
- **New files**: none (may need a small `AgendaPanel.svelte` helper component)
- **No new API endpoints** — existing calendar data from `eventsStore`
- **Depends on**: `desktop-layout-foundation`
- **Stitch reference**: https://stitch.withgoogle.com/projects/6101620989348291389 (Kalender screen)
