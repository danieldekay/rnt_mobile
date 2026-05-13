## Why

The `/links` page currently provides functional filtering via dropdown and search, but the mobile card layout lacks visual polish and the category selection could be more accessible. Adding visual category chips and improving the mobile card design will improve usability, especially on mobile devices where most users access the PWA.

## What Changes

- Replace category dropdown with horizontal scrollable category filter chips
- Improve mobile card design with better spacing, category badges, and visual hierarchy
- Add subtle hover states for interactive elements
- Keep existing search functionality and table view on desktop unchanged

## Capabilities

### New Capabilities

- `links-page-filter-ui`: Enhanced category filtering with visual chips and improved mobile card layout

### Modified Capabilities

- None - this is purely a UI enhancement without behavioral changes

## Impact

- Modified: `src/routes/links/+page.svelte` (filter UI and mobile cards)
- No changes to API or data fetching logic
- Maintains static prerendering compatibility