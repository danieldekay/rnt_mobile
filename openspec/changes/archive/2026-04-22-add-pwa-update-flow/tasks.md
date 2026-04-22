## 1. Version Detection Foundation

- [x] 1.1 Enable SvelteKit version polling in `svelte.config.js` with a conservative interval suitable for mobile sessions.
- [x] 1.2 Add a client-side update state module under `src/lib/` that wraps SvelteKit's `updated` API, manual update checks, apply-update reload behavior, and non-blocking failure state.

## 2. App Shell Update UX

- [x] 2.1 Add a focused update notice or shared update component for the app shell that explains when a newer build is available and offers a refresh action.
- [x] 2.2 Update `src/routes/+layout.svelte` to wire the update state into the existing install or footer surfaces without crowding consent or install prompts on mobile.
- [x] 2.3 Extend the app version area with a manual “check for updates” action and short recovery guidance for stale installed sessions.

## 3. Docs And Validation

- [x] 3.1 Update the PWA installation or update communication docs and deployment notes to reflect the actual in-app update behavior.
- [x] 3.2 Run `npm run check` and fix any regressions introduced by the update flow.
- [x] 3.3 Run `npm run build` and confirm the static build still succeeds with the update polling and app-shell changes.