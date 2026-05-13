## Context

The DJ listing page (`/djs`) currently filters DJs to only show those with upcoming events in the selected time period. The filter is applied in `src/routes/djs/+page.svelte` via:

```svelte
const dateFilteredDjs = $derived.by(() =>
    djs
        .filter((dj) => dj.countsByDateFilter[activeDateFilter] > 0)
        .sort(...)
);
```

This means DJs from the WP REST API CPT who don't have events in the selected window are hidden, even though they are valid DJs in the system.

The data loading in `+page.ts` already fetches all CPT DJs and all events, then merges them in `getDjsFromCptAndEvents()`. CPT DJs without events are already seeded into the results with zero counts.

## Goals / Non-Goals

**Goals**:

- All WP REST API DJs are always visible on the listing page
- DJs with upcoming events show normal event count badges
- DJs without upcoming events show "Keine Termine" with muted styling
- Sorting by name (ascending) when event counts are equal
- Preserve existing date filter chips for navigation context

**Non-Goals**:

- Adding a toggle to show/hide all DJs (simplified: always show all)
- Changing how DJ data is fetched from the API
- Modifying the event detail page or DJ profile page

## Decisions

1. **Remove the event-count filter from dateFilteredDjs**: Instead of filtering by `countsByDateFilter[activeDateFilter] > 0`, we'll show all DJs. The date filter chips remain for navigation context but don't hide DJs.

2. **Sort by name when counts are equal**: Since all DJs are shown, we can't rely on count-based sorting. We'll sort by name (ascending) with upcoming count as secondary (descending).

3. **Keep the date filter chips**: They provide useful navigation context (quick jump to dates) without hiding content.

## Risks / Trade-offs

- [Risk: More DJs shown = potentially longer list] → Mitigation: Sorting by name keeps it organized; muted styling for zero-event DJs helps scannability
- [Risk: Perceived as "empty" DJs without events] → Mitigation: Clear "Keine Termine" badge with muted styling indicates they exist but have no current schedule

## Migration Plan

- No deployment concerns - static site, just UI change
- No rollback needed - just revert the filter change
