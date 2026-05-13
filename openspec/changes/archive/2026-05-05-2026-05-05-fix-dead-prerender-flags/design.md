## Files Changed

- `src/routes/event/[id]/+page.ts`

## Approach

1. Delete both `export const prerender = false;` and `export const ssr = false;` lines.
2. Keep the file as an empty (or no-export) stub — SvelteKit's default is `prerender: true` / `ssr: true`.
3. The `+page.svelte` already uses `onMount` for fetching, which works fine with SSR (the fetch runs on server, then hydrates on client).

## Design Decisions

- No loader needed — the detail page fetches via `onMount` in `+page.svelte`, which is compatible with SSR.
- The `fetchEventById` call in `onMount` runs client-side; SSR provides the shell instantly.
