# calendar-performance-spec

## Capability: Calendar Grid Performance

### Description
The calendar component MUST precompute an event-map from the events list once per render cycle,
eliminating O(n×42) per-day filtering during grid construction.

### Requirements

#### REQ-1: Precomputed event map
- The calendar MUST expose a function `buildEventMap(events: TribeEvent[])` that reduces
  all events into `{ YYYY-MM-DD: TribeEvent[] }` key-value pairs.
- The map MUST be derived inside `$derived.by()` alongside the days array, so it updates
  only when `events` or `currentMonth` change — not on every day iteration.

#### REQ-2: O(1) day event lookup
- The calendar grid `{#each}` loop MUST use `{@const dayEvents = eventMap.get(dateKey) ?? []}`
  instead of calling `getEventsForDate(day)` on every day.
- The helper `getEventsForDate()` MUST be removed entirely.

#### REQ-3: No visual regression
- The calendar MUST render the same visual output: event counts, accent dots, today/highlighted
  badges, and date labels must match existing behavior exactly.

#### REQ-4: Mobile performance
- Month navigation (prev/next/Today) MUST complete grid render within 16ms on a mid-range mobile device,
  measured via the Calendar component's `{#each days}` loop timing.

### Testing Checklist
- [ ] Calendar renders correctly with 100+ events across all month days
- [ ] Month navigation triggers smooth transitions without jank
- [ ] Precomputed map key collision test: two events on same date appear correctly
- [ ] `npm run check` passes with 0 errors
