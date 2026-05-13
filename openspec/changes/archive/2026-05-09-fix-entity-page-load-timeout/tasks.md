## 1. Add fetchOrganizerEvents API function

- [x] 1.1 Add `fetchOrganizerEvents` function in `src/lib/api/tribe.ts` that calls `/wp-json/tribe/events/v1/events?organizer=<id>`
- [x] 1.2 Export the function from tribe.ts module
- [x] 1.3 Add TypeScript types for the organizer events response

## 2. Update organizer detail page

- [x] 2.1 Update `/veranstalter/[slug]/+page.ts` to import and use `fetchOrganizerEvents` instead of `fetchAllEvents`
- [x] 2.2 Remove client-side event filtering that is no longer needed
- [x] 2.3 Keep existing error handling and 404 behavior

## 3. Validation

- [x] 3.1 Run `npm run check` to verify TypeScript types
- [x] 3.2 Run `npm run build` to verify static build works
