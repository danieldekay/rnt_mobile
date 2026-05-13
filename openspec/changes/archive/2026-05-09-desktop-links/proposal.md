## Why

The tango community has a rich ecosystem of websites, YouTube channels, online resources, and tools. A curated Links page surfaces these resources in a structured, easy-to-scan directory — providing genuine value without requiring any custom CMS, since the links can be stored as static content in the app.

## What Changes

- Add new route `src/routes/links/` with `+page.svelte` (static data, no load function required).
- Content: a static array of curated link objects defined in a `src/lib/content/links.ts` data file, grouped by category (Musik, Lehrvideos, Community, Veranstaltungsportale, Organisationen, usw.).
- Desktop: three-column sectioned link directory in main column; right sidebar shows a category jump-navigation.
- Mobile: single-column list of sections.
- "Link vorschlagen" — a simple email link (`mailto:`) button in the sidebar for community submissions.
- Nav link "Links" already in `LeftSidebar`.

## Capabilities

### New Capabilities

- `desktop-links`: Curated links directory — static data, categorised, three-column desktop grid, category jump-nav in right sidebar.

### Modified Capabilities

None.

## Impact

- **New files**: `src/routes/links/+page.svelte`, `src/lib/content/links.ts`
- **No new API endpoints** — static data
- **Prerender**: straightforward; no async data
- **Depends on**: `desktop-layout-foundation`
- **Stitch reference**: https://stitch.withgoogle.com/projects/6101620989348291389 (Links screen)
