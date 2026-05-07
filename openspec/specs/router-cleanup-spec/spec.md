# Capability: Router Dead Flag Cleanup

## Purpose

Remove dead `prerender` and `ssr` flags from the event detail route so the page renders with SvelteKit's default SSR behavior instead of forcing a client-only load.

## Requirements

### Requirement: Dead flags removed
- `export const prerender = false` MUST be deleted from `+page.ts`.
- `export const ssr = false` MUST be deleted from `+page.ts`.
- The file may be left empty or with a minimal stub; SvelteKit defaults apply.

#### Scenario: SSR-enabled detail page
- After removal, the event detail page MUST render via SSR (not client-only).
- The existing `onMount` fetch pattern in `+page.svelte` MUST continue to work without the `ssr: false` override.

### Requirement: Static build compatibility
- The static build MUST still succeed with both flags removed.
- No new Cloudflare Pages routing rules are required.

#### Scenario: Static build succeeds
- **WHEN** `npm run build` is executed
- **THEN** the build completes without errors and produces valid static assets
