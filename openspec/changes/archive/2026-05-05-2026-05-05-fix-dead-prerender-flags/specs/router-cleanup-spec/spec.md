# router-cleanup-spec

## Capability: Router Dead Flag Cleanup

### Description
The event detail route (`src/routes/event/[id]/+page.ts`) MUST NOT export dead `prerender` or `ssr` flags.
Both flags are unnecessary noise and the `ssr: false` flag actively harms load performance.

### Requirements

#### REQ-1: Dead flags removed
- `export const prerender = false;` MUST be deleted from `+page.ts`.
- `export const ssr = false;` MUST be deleted from `+page.ts`.
- The file may be left empty or with a minimal stub; SvelteKit defaults (`prerender: true`, `ssr: true`) apply.

#### REQ-2: SSR-enabled detail page
- After removal, the event detail page MUST render via SSR (not client-only).
- The existing `onMount` fetch pattern in `+page.svelte` MUST continue to work
  without the `ssr: false` override.

#### REQ-3: Static build compatibility
- The static build MUST still succeed with both flags removed.
- No new Cloudflare Pages routing rules are required.
