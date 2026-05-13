## Files Changed

- `src/lib/components/Calendar.svelte`

## Approach

1. Create `buildEventMap(events: TribeEvent[])` — reduces the event list once into a `{ YYYY-MM-DD: TribeEvent[] }` map.
2. Replace `const { days, monthName, year } = $derived(getMonthData(currentMonth))` with `$derived.by(() => { days = ...; eventMap = buildEventMap(events); })`.
3. Replace `{@const dayEvents = getEventsForDate(day)}` with O(1) map lookup: `const dayEvents = eventMap.get(dateKey) ?? []`.
4. Remove `getEventsForDate()` function entirely.

## Design Decisions

- Precompute map once per events prop change, not per day.
- Map keys use `toISOString` date-part for stability.
- No external library dependency.
