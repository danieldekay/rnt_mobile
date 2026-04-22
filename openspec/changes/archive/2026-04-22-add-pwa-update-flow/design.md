## Context

The app shell in [src/routes/+layout.svelte](/Users/danieldekay/Dokumente/projects/programmieren/rnt_mobile/src/routes/+layout.svelte) already handles install prompting, consent UI, and footer metadata, including the injected `__APP_VERSION__` string. That means the user can see the current app version, but there is no matching update state, no manual update check, and no in-app action that helps an installed PWA move onto a newer deployment.

The deployment remains fully static: [src/routes/+layout.ts](/Users/danieldekay/Dokumente/projects/programmieren/rnt_mobile/src/routes/+layout.ts) disables SSR, [svelte.config.js](/Users/danieldekay/Dokumente/projects/programmieren/rnt_mobile/svelte.config.js) uses adapter-static with prerendering, and the repo has no custom service worker file. The lightest safe solution is therefore to build on SvelteKit's native version invalidation instead of introducing custom cache lifecycle logic just for update prompting.

This change is cross-cutting enough to justify a design doc because it touches framework config, app-shell state, user guidance, and Cloudflare-hosted static delivery behavior all at once.

## Goals / Non-Goals

**Goals:**
- Detect that a newer deployed build exists while the app is open.
- Give the user a clear manual way to refresh into that newer build from the app shell, especially in standalone installed mode.
- Keep the update UX mobile-readable and non-blocking for core event browsing.
- Reuse the existing app version footer and Svelte 5 client patterns instead of inventing a separate update subsystem.
- Stay compatible with prerendered static deployment on Cloudflare Pages.

**Non-Goals:**
- No offline-first redesign or broader caching architecture work.
- No custom service worker for background sync, push, or asset precaching unless SvelteKit's native update path proves insufficient during implementation.
- No changes to event fetching in [src/lib/api/tribe.ts](/Users/danieldekay/Dokumente/projects/programmieren/rnt_mobile/src/lib/api/tribe.ts) or to route-specific event behavior.
- No requirement to show release notes or a changelog inside the app.

## Decisions

### Decision: Use SvelteKit's native version invalidation instead of adding a custom service worker
- Choice: enable `kit.version.pollInterval` in [svelte.config.js](/Users/danieldekay/Dokumente/projects/programmieren/rnt_mobile/svelte.config.js) and consume the framework's `updated` state plus `updated.check()` from the client.
- Rationale: the build already emits SvelteKit version metadata, the app is prerendered with no server session layer, and there is currently no custom service worker to extend. Using the framework-native update signal is the smallest change that solves the user problem directly.
- Alternative considered: add a custom `src/service-worker.ts` with explicit cache names and upgrade handling.
- Why not: it expands scope from “easy updates” into cache ownership, invalidation, and rollout behavior that the app does not otherwise need today.

### Decision: Centralize update state in a dedicated client module and render it from the layout
- Choice: add a small client-side module such as `src/lib/stores/pwa-update.svelte.ts` to wrap automatic polling, manual `updated.check()` calls, transient check state, and recovery messaging; render the resulting banner or panel from [src/routes/+layout.svelte](/Users/danieldekay/Dokumente/projects/programmieren/rnt_mobile/src/routes/+layout.svelte), optionally with a focused component like `src/lib/components/PwaUpdateBanner.svelte`.
- Rationale: the layout already owns install and consent surfaces, so update state belongs in the same app-shell layer, but the state transitions should not be embedded inline beside unrelated consent logic.
- Alternative considered: put all update logic directly in the layout component.
- Why not: it would make a single route-level component responsible for install prompts, consent, analytics routing, and update orchestration at once.

### Decision: Treat the applied update as a hard reload of the current app URL
- Choice: when an update is available and the user accepts it, trigger a refresh that reloads the current route into the newest deployed shell rather than trying to swap assets in place.
- Rationale: a hard reload is the most reliable way to leave the old JavaScript shell behind in a static SPA/PWA deployment.
- Alternative considered: rely only on client-side invalidation without reloading the document.
- Why not: that is more likely to leave the session on stale in-memory code, especially in an installed PWA window.

### Decision: Pair the update banner with a manual check and short recovery guidance
- Choice: expose a manual “check for updates” affordance and short recovery steps near the existing version display in the app shell so the user can force a check and understand what to do if the older view persists.
- Rationale: the user request is explicitly about making updates easy, which means passive detection alone is not enough; users need a visible self-service path.
- Alternative considered: show only an automatic update banner when a newer build is detected.
- Why not: users who suspect they are on an older build would still have no direct way to confirm or recover.

## Risks / Trade-offs

- [A polling interval that is too aggressive wastes network and battery] → Mitigation: keep the automatic interval conservative and rely on manual checks for urgent refreshes.
- [Cloudflare or browser caching can delay visibility of the newest build] → Mitigation: use SvelteKit's version endpoint for invalidation, use a hard reload for apply, and provide explicit recovery steps when the shell still appears stale.
- [The app may momentarily report “up to date” while a deployment is still propagating] → Mitigation: keep status wording non-absolute and let the user retry manual checks.
- [Adding another shell banner can crowd the existing install and consent surfaces on small screens] → Mitigation: render the update notice only when relevant and collapse manual check or recovery details behind a lightweight secondary action when no update is pending.

## Migration Plan

1. Enable SvelteKit version polling in [svelte.config.js](/Users/danieldekay/Dokumente/projects/programmieren/rnt_mobile/svelte.config.js).
2. Add the PWA update state module and connect it to the framework `updated` API.
3. Extend [src/routes/+layout.svelte](/Users/danieldekay/Dokumente/projects/programmieren/rnt_mobile/src/routes/+layout.svelte) with a mobile-friendly update surface, manual check action, and recovery guidance near the current version area.
4. Update the existing PWA communication or deployment docs that currently describe update behavior too loosely, especially [docs/pwa-communication/pwa-how-to-install-and-update.md](/Users/danieldekay/Dokumente/projects/programmieren/rnt_mobile/docs/pwa-communication/pwa-how-to-install-and-update.md) and the PWA section in [DEPLOY.md](/Users/danieldekay/Dokumente/projects/programmieren/rnt_mobile/DEPLOY.md).
5. Validate with `npm run check` and `npm run build` because the change touches framework config, layout behavior, and prerendered output.
6. Roll back by removing the polling config and update UI module together; the app will return to its current install-only behavior.

## Open Questions

- What polling interval gives the best trade-off for this audience: frequent enough to notice same-day deployments, but conservative enough for long-lived mobile sessions?
- Should the manual update check live directly in the footer version row, or inside a compact “app status” surface that can also hold recovery guidance?