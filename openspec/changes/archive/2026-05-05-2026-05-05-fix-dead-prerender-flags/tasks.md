## ADDED Requirements

### Requirement: Remove dead prerender/ssr flags from event detail route
- [x] 1.1 Delete `export const prerender = false;` from `src/routes/event/[id]/+page.ts`
- [x] 1.2 Delete `export const ssr = false;` from `src/routes/event/[id]/+page.ts`
- [x] 1.3 Confirm `+page.ts` is empty after removal (SvelteKit default behavior applies)
- [x] 1.4 Run `npm run check` to verify no build-time errors
- [x] 1.5 Run `npm run build` to verify static build still succeeds

## COMPLETED Requirements

- [x] 2.1 Verify event detail page loads with SSR shell visible
