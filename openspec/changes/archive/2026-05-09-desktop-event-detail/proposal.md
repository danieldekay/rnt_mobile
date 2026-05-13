## Why

The event detail page (`/event/[slug]`) currently shows all content in a single narrow column. On desktop, the right sidebar can present key event metadata (date, venue, organiser, ticket link) as a sticky panel, while the main column holds the full event description and image — matching the standard two-pane event-detail pattern in the Stitch design.

## What Changes

- Update `src/routes/event/[slug]/+page.svelte` to use `DesktopLayout`'s `rightSidebar` on desktop.
- Main column: event hero image, title, description, badges.
- Right sidebar: date/time, venue name + link, organiser name + link, ticket/registration link (CTA button), event-type and music-type badges.
- No changes to API calls, types, or mobile layout.

## Capabilities

### New Capabilities

- `desktop-event-detail`: Desktop event detail view — two-pane layout with sticky metadata sidebar; mobile unchanged.

### Modified Capabilities

- `event-detail`: Desktop rendering added; mobile behaviour and data contract unchanged.

## Impact

- **Files changed**: `src/routes/event/[slug]/+page.svelte`
- **New files**: none (may extract a small `EventMetaPanel.svelte` component)
- **No new API endpoints**
- **Depends on**: `desktop-layout-foundation`
- **Stitch reference**: https://stitch.withgoogle.com/projects/6101620989348291389 (Event Detail screen)
