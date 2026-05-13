# Tasks: Performance Optimization (DJs & Organizers)

## Phase 1: Data Fetching Optimization

- [x] 1.1 Analyze and bound `fetchAllEvents` usage in `src/routes/djs/+page.ts`
    - Change the `dateFilter` from `'all'` to a more reasonable default or bounded range (e.g., `'month'` or a custom 6-month window) if the API payload is too large.
    - Investigate if the WordPress Tribe Events API supports fetching only the fields needed for DJ/Organizer extraction to reduce JSON size.
- [x] 1.2 Optimize `src/routes/veranstalter/+page.ts` load function
    - Similar to the DJ page, bound the event fetch to avoid processing years of historical data on every page load.
    - Parallelize the `fetchOrganizers` and `fetchAllEvents` calls (already done, but verify performance).

## Phase 2: Processing & Caching

- [x] 2.1 Refactor DJ/Organizer extraction logic
    - Move expensive string parsing and regex extraction of DJs from the main thread if possible, or optimize the loops in `src/lib/utils/djs.ts`.
- [x] 2.2 Implement basic client-side caching
    - Store the derived list of DJs and Organizers in a Svelte store or `sessionStorage` after the first fetch to make switching between the "DJs" and "Veranstalter" tabs near-instant.
    - Add a timestamp to the cache to allow for background re-validation (SWR pattern).

## Phase 3: UX & Loading Feedback

- [x] 3.1 Refine skeleton loaders
    - Ensure the pulse animations in `src/routes/djs/+page.svelte` and `src/routes/veranstalter/+page.svelte` align with the actual content structure to reduce layout shift.
- [x] 3.2 Add "Partial Loading" or Pagination
    - If the list of DJs remains large, implement a "Show More" or infinite scroll to avoid rendering 100+ cards at once.

## Phase 4: Validation

- [x] 4.1 Benchmark load times
    - Measure the time from navigation start to "data ready" on the DJs and Organizer tabs.
- [x] 4.2 Run `npm run check` to ensure type safety.