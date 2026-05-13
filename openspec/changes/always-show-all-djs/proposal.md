## Why

The DJ listing page currently filters DJs to only show those with upcoming events in the selected time period, hiding DJs from the WP REST API CPT who don't have events. Users should be able to browse all DJs from the WordPress REST API regardless of their current event schedule.

## What Changes

- Remove the event-count filter from the DJ listing page so all WP REST API DJs are always shown
- DJs with upcoming events display normally with event count badges
- DJs without upcoming events show "Keine Termine" badge with muted styling
- Preserve sorting by name (since all DJs will be shown regardless of count)

## Capabilities

### New Capabilities

- `show-all-djs`: DJ listing always shows all WP REST API DJs regardless of event count

### Modified Capabilities

- `dj-listing`: Change filtering behavior to always show all CPT DJs, not just those with events

## Impact

- Changes in `src/routes/djs/+page.svelte` - remove date-filter-based filtering of DJs
- Changes in `src/routes/djs/+page.ts` - may need to adjust data loading or date range logic
- Potential changes in `src/lib/utils/djs.ts` - ensure CPT DJs without events are included in results
- No API changes needed - uses existing WP REST API endpoints
- No breaking changes - enhances visibility of existing data
