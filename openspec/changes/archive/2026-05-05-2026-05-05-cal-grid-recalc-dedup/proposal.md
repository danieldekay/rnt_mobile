## Why

Calendar.svelte recomputes `getEventsForDate()` for every day in the 42-day grid on every reactive update. With 42 slots × N events, this is O(n×42) work on each trigger — including when the parent passes new props. On mobile, this causes jank during month navigation.

## What Changes

- Add a `precomputeEventMap()` helper that builds a `{ dateString: Event[] }` map from the events list once.
- Replace `getEventsForDate()` calls with O(1) map lookups.
- Derive the event map so it updates only when `events` prop changes, not on every day iteration.

## Capabilities

### Modified Capabilities

- `calendar-browsing`: Improves the calendar grid's reactivity model to eliminate redundant O(n×42) recalculations via a precomputed event map.

## Impact

- Affected file: `src/lib/components/Calendar.svelte` only.
- No API or data-shape changes.
- No deployment-model changes.
- Pure internal performance optimization.
