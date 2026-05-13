## Why

The events list page (`/`) currently renders a single narrow column regardless of viewport. On desktop, the full-width shell introduced by `desktop-layout-foundation` creates space for a two- or three-column event card grid, a persistent filter panel on the right sidebar, and richer filtering controls — resulting in a significantly more usable events-browsing experience for desktop users.

## What Changes

- Update `src/routes/+page.svelte` to use `DesktopLayout`'s `rightSidebar` snippet slot on desktop to show a filter/date panel.
- At `lg:` breakpoint, render event cards in a two-column (or three-column for very wide screens) CSS grid.
- Move the `DateFilter` and category/music-type filter chips to the right sidebar on desktop (they remain in-line on mobile).
- Add a "Kommende Veranstaltungen" count badge and month-summary in the right sidebar.
- No changes to API calls, store logic, or mobile layout.

## Capabilities

### New Capabilities

- `desktop-events-list`: Desktop events list view — card grid layout with right-sidebar filter panel; mobile layout unchanged.

### Modified Capabilities

- `home-event-browsing`: Desktop rendering added; mobile behaviour and API contract unchanged.

## Impact

- **Files changed**: `src/routes/+page.svelte`
- **New files**: none
- **No new API endpoints** — uses existing `eventsStore`
- **Depends on**: `desktop-layout-foundation` (DesktopLayout, RightSidebar components)
- **Prerender**: no change; route is already prerendered
- **Stitch reference**: https://stitch.withgoogle.com/projects/6101620989348291389 (Veranstaltungen screen)
