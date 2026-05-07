## Why

`src/routes/event/[id]/+page.ts` exports `prerender: false` and `ssr: false`, making it the only non-static route in the entire project. Both flags are dead code:
- The page uses `$page.params` from a `+page.ts` loader — SvelteKit handles this correctly with SSR.
- The `prerender` flag is irrelevant in an `event/[id]` dynamic route.
- The `ssr: false` flag prevents server-side rendering, forcing client-only loads and a visible loading state instead of an instant-first-render.

## What Changes

- Remove both `export const prerender = false;` and `export const ssr = false;`.
- Convert `+page.ts` to a data-only loader.

## Capabilities

### Modified Capabilities

- `event-detail`: The detail page becomes SSR-enabled, reducing initial load time and improving LCP on mobile.

## Impact

- Affected file: `src/routes/event/[id]/+page.ts` only.
- Removes dead configuration that contradicts the project's static-only deployment model.
- No deployment-model changes.
