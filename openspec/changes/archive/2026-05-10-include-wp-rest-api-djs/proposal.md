## Why

Currently, the DJ listing page only displays DJs who have upcoming events matching the selected date filter. This means DJs who exist in the WordPress REST API Custom Post Type but have no events in the selected time period are not shown, even though they are valid DJs in the system. Users should be able to browse all DJs from the WP REST API regardless of their current event schedule.

## What Changes

- Modify the DJ listing logic to include all DJs from the WP REST API Custom Post Type
- Show DJs without upcoming events with appropriate visual indicators (e.g., "No upcoming events")
- Preserve existing sorting and filtering capabilities
- Maintain backward compatibility with current behavior as default option

## Capabilities

### New Capabilities
- `show-all-wp-djs`: Capability to display DJs from WP REST API regardless of event count

### Modified Capabilities
- `dj-listing`: Change requirements to include WP REST API DJs without events

## Impact

- Changes in `src/lib/utils/djs.ts` - the DJ processing logic
- Changes in `src/routes/djs/+page.svelte` - the DJ listing UI
- Potential changes in `src/routes/djs/+page.ts` - the data loading logic
- No API changes needed - uses existing WP REST API endpoints
- No breaking changes - maintains existing functionality as optional behavior