## 1. Update DJ listing filter logic

- [x] 1.1 Remove event-count filter from dateFilteredDjs in src/routes/djs/+page.svelte
- [x] 1.2 Update sorting to prioritize upcoming count (descending), then name (ascending)
- [x] 1.3 Update visibleCount calculation to reflect all DJs

## 2. Verify existing data loading

- [x] 2.1 Confirm fetchDjCptList fetches all WP REST API DJs
- [x] 2.2 Confirm getDjsFromCptAndEvents includes CPT DJs without events

## 3. Testing and validation

- [x] 3.1 Run npm run check to verify no TypeScript errors
- [x] 3.2 Run npm run build to verify static adapter compatibility
