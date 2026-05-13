## Why

The RNT website publishes announcements ("Ankündigungen") as WordPress posts with a specific category or custom post type. Currently the app has no dedicated page for these. A desktop Ankündigungen page surfaces priority announcements prominently and provides an archive list in the sidebar, keeping the community informed about upcoming news.

## What Changes

- Add new route `src/routes/ankuendigungen/` with `+page.svelte` and `+page.ts`.
- Load function: fetches WP posts filtered by the "Ankündigungen" category (category slug or ID — to be determined by inspection of the WP API).
- Desktop: featured/priority announcement in main column header area; remaining announcements as a list below. Right sidebar: archive navigation (by month/year).
- Mobile: single-column list.
- New nav link "Ankündigungen" already included in `LeftSidebar` nav list from `desktop-layout-foundation`.
- Add `fetchAnnouncements()` to `src/lib/api/posts.ts` (reuses `BlogPost` type).

## Capabilities

### New Capabilities

- `desktop-ankuendigungen`: Announcements page — WP posts filtered by "Ankündigungen" category; desktop has archive sidebar; mobile is single-column list.

### Modified Capabilities

None.

## Impact

- **New files**: `src/routes/ankuendigungen/+page.svelte`, `src/routes/ankuendigungen/+page.ts`
- **Files changed**: `src/lib/api/posts.ts` (add `fetchAnnouncements`)
- **New API endpoint**: `/wp-json/wp/v2/posts?categories=<id>` (category ID TBD)
- **Depends on**: `desktop-layout-foundation`, `desktop-blog` (reuses `BlogPost` type and posts API module)
- **Stitch reference**: https://stitch.withgoogle.com/projects/6101620989348291389 (Ankündigungen screen)
