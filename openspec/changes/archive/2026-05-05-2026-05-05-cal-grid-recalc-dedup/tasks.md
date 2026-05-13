## ADDED Requirements

### Requirement: Calendar grid uses precomputed event map, not per-day filtering

- [x] 1.1 Add `buildEventMap(events)` helper that reduces all events into `{ YYYY-MM-DD: Event[] }` map
- [x] 1.2 Replace `$derived(getMonthData(currentMonth))` with `$derived.by(() => { days = ...; eventMap = buildEventMap(events); })`
- [x] 1.3 Replace `{@const dayEvents = getEventsForDate(day)}` with O(1) map lookup `eventMap.get(key) ?? []`
- [x] 1.4 Remove `getEventsForDate()` function entirely
- [x] 1.5 Run `npm run check` to confirm no regressions
- [x] 1.6 Run `npm run build` to confirm static build still passes

## COMPLETED Requirements

- [x] 2.1 Verify calendar month navigation is smooth with 100+ events
