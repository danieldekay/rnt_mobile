## Why

The app can already be installed as a PWA, but the installed experience does not give users a clear, reliable way to move onto a newer deployment. Right now the update story is mostly implicit, which is risky on phones where an installed app can stay open on an older shell long after a new static build is live.

## What Changes

- Add an in-app PWA update flow that can detect when a newer deployed build is available and surface a clear refresh action to the user.
- Add user-visible update status in the app shell for installed and browser-based sessions so people understand whether they are on the current version.
- Add build-version metadata and update-check plumbing that works with the existing static SvelteKit build and Cloudflare Pages deployment.
- Add fallback guidance for cases where a stale installed shell does not switch immediately, so users can recover without reinstalling blindly.

## Capabilities

### New Capabilities
- `pwa-update-flow`: Defines how the app detects newer builds, informs the user about update availability, and lets the user refresh into the new version from an installed PWA session.

### Modified Capabilities
- None.

## Impact

- Affected views will primarily live in the app shell, especially [src/routes/+layout.svelte](/Users/danieldekay/Dokumente/projects/programmieren/rnt_mobile/src/routes/+layout.svelte), with supporting bootstrap or static asset changes for version and update detection.
- Expected implementation surfaces include manifest or version metadata, a service worker or equivalent cache/update coordinator, and shared UI for update notices; event data loading from the RNT API is not expected to change.
- API impact should stay internal to the app delivery path: the events feed remains unchanged, while the build may expose a lightweight version descriptor or similar static asset for update checks.
- Deployment impact is significant for prerendering and Cloudflare Pages caching: the solution must remain compatible with a fully static build, avoid breaking standalone installs, and define how updated assets become visible across cached sessions.