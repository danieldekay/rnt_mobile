## Context

The RNT Kalender is a SvelteKit PWA that displays tango events from a WordPress site. The DJ listing feature currently:
- Fetches events from WP REST API `/tribe/events/v1` endpoint
- Extracts DJ names from event descriptions using regex patterns
- Combines with WP REST API DJ Custom Post Type data (`/wp/v2/dj`)
- Only displays DJs who have events matching the selected date filter
- Located in `/src/routes/djs/` with processing logic in `/src/lib/utils/djs.ts`

Current limitation: DJs from the CPT with zero matching events are filtered out in the UI layer.

## Goals / Non-Goals

**Goals:**
- Display all DJs from WP REST API CPT regardless of event count in selected period
- Maintain existing sorting (by upcoming events, then name) and filtering capabilities
- Provide clear visual indication when a DJ has no upcoming events in the selected period
- Preserve backward compatibility - existing behavior should remain available
- Keep performance impact minimal

**Non-Goals:**
- Change the underlying data fetching mechanisms
- Modify how DJ names are extracted from event descriptions
- Alter the WP REST API endpoints being called
- Change the event listing functionality elsewhere in the app
- Remove existing DJ listing behavior entirely

## Decisions

### 1. Approach to Including Zero-Event DJs
**Decision:** Modify the UI filtering logic rather than the data processing
- **Why:** The `getDjsFromCptAndEvents` function already correctly includes all CPT DJs with zero initial counts
- **Alternative considered:** Changing the data processing to always include CPT DJs
- **Trade-off:** UI approach is less invasive and preserves existing data structures

### 2. Visual Representation of Zero-Event DJs
**Decision:** Show DJs with zero events but with visual indicators and disabled actions
- **Why:** Maintains usability while being clear about availability
- **Alternative considered:** Separate section for DJs without events
- **Trade-off:** Mixed list requires clear visual cues but keeps all DJs in one browsable list

### 3. Implementation Location
**Decision:** Modify filtering in `src/routes/djs/+page.svelte` derived values
- **Why:** This is where the current `dj.countsByDateFilter[activeDateFilter] > 0` filter exists
- **Alternative considered:** Changing the filtering in the data loading layer
- **Trade-off:** View-layer change keeps the data processing pure and testable

### 4. Backward Compatibility
**Decision:** Keep current behavior as default, add optional toggle to show all WP DJs
- **Why:** Respects existing user expectations while adding new functionality
- **Alternative considered:** Making the new behavior the default
- **Trade-off:** Requires UI control but prevents surprising existing users

## Risks / Trade-offs

[Performance impact] → Minimal - only changes UI filtering, data processing unchanged
[Visual clutter] → Mitigated by clear visual indicators and tooltips explaining the state
[Inconsistent state] → Avoided by keeping data processing unchanged, only modifying display logic
[Increased initial load] → None - same data fetched, only display logic changes

## Migration Plan

1. Add toggle control to DJ listing toolbar for "Show all WP API DJs"
2. Modify derived values in +page.svelte to conditionally apply event count filter
3. Update DJ card component to show appropriate state for zero-event DJs
4. Add tooltip/explanation for why some DJs show "No upcoming events"
5. Default behavior remains showing only DJs with events (backward compatible)
6. No database or API changes required
7. Rollback: Simply remove the toggle and revert filtering logic

## Open Questions

1. Should the toggle be persistent across sessions (store in localStorage)?
2. What specific visual treatment should zero-event DJs receive (opacity, text treatment, etc.)?
3. Should we show a count of how many DJs are being shown vs total available?