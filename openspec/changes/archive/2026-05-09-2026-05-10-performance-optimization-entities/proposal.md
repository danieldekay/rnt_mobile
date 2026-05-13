# Proposal: Performance Optimization for DJs and Organizers

This change addresses the slow loading times on the DJs and Organizer tabs by optimizing how data is fetched and processed.

## What Changes

### Data Fetching Strategy
- Replace the current "fetch all events" (`all`) approach in `+page.ts` load functions with a more targeted query.
- Shift from client-side filtering of massive event lists to server-side/API-level filtering where possible.
- If the API doesn't support aggregate "DJ/Organizer" endpoints, implement a bounded fetch (e.g., next 3-6 months instead of "all") to reduce payload size.

### Loading States & UX
- Optimize the `djs` and `veranstalter` route load functions to parallelize metadata and event fetching.
- Ensure skeleton loaders or progress indicators are responsive and provide immediate feedback.
- Consider caching derived entity lists (DJs/Organizers) in a local store or session storage to make tab-switching instantaneous after the first load.

## Why Changes

- **Performance**: The DJ and Organizer tabs currently load "extremely slowly" because they fetch and process every single event in the system to extract entity names and counts.
- **Scalability**: As the number of past and future events grows, the current approach will continue to degrade.
- **User Retention**: Slow loading times on primary navigation tabs lead to a poor user experience and high bounce rates.

## Impact

- Significantly faster transition to the DJs and Organizer pages.
- Reduced data usage for mobile users.
- Lower memory footprint on the client as large event arrays are no longer held in memory just to extract a few names.