# Safari/PWA release smoke checklist

Use this checklist after any change that can affect the app shell, service worker, cache headers, navigation routing, installability, event views, or deployment workflow.

## Preconditions

- The production deploy workflow has completed successfully.
- The tested URL is the production origin, not a local preview.
- The tested device is not only in private browsing mode.
- The tester records device, OS version, browser, install state, and app version from `/app-status`.

## Required devices and launch modes

At minimum, verify these modes:

- iPhone Safari normal tab.
- iPhone Safari bookmarked launch.
- iPhone Home Screen / installed PWA launch, when installed.
- iPhone Safari private tab as a control case.
- Desktop Safari or Chrome as a non-iOS comparison, when available.

## Core smoke path

For each required launch mode:

1. Open `/app-status`.
2. Record the app version, service worker support, controller state, cache count, and current URL.
3. Open `/`.
4. Confirm the event list loads.
5. Switch to list, calendar, and map views.
6. Reload once.
7. Close and reopen from the same launch mode.
8. Confirm the app still loads the current shell and view navigation still works.
9. Open `/recovery` but do not run recovery unless the app is stale or broken.

## Update-specific smoke path

Use this path when testing update reliability:

1. Start from a device or browser profile that previously opened the old release.
2. Launch `/` normally.
3. Confirm the new release appears without requiring private browsing.
4. Open `/app-status` and record the version and cache state.
5. If stale content appears, open `/recovery` and run the repair action.
6. Confirm the app reloads to `/` with a cache-busting URL.
7. Close and reopen via Safari bookmark or Home Screen icon.
8. Confirm the new release remains visible.

## Header smoke path

Manually spot-check these response headers when diagnosing deploy or cache behavior:

- `/` should use `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`.
- `/service-worker.js` should use no-store cache headers and `Service-Worker-Allowed: /`.
- `/_app/version.json` should use no-store cache headers.
- `/_app/immutable/*` should use long-lived immutable caching.

The automated post-deploy header verifier should cover the same critical paths, but a manual check is still useful during incidents.

## Pass/fail criteria

A release passes only when:

- Normal Safari, bookmarked launch, and installed PWA launch all show the current release.
- Private browsing is not the only mode that works.
- `/app-status` is reachable.
- `/recovery` is reachable.
- The event list and calendar view load.
- No launch mode is stuck on an old app shell after close/reopen.

Fail the smoke test when:

- Normal Safari or a bookmark shows old content while private browsing shows new content.
- The installed PWA never updates after close/reopen.
- `/app-status` or `/recovery` is unreachable.
- The app requires manual cache deletion before the recovery route can load.
- Header verification fails for `/`, `/service-worker.js`, or `/_app/version.json`.

## Incident notes to capture

When a failure occurs, record:

- Device and OS version.
- Browser and launch mode.
- Exact URL used.
- `/app-status` output.
- Whether `/recovery` fixed the issue.
- Screenshots of stale/current differences.
- Whether private browsing behaves differently.
- Related deploy run, PR, and commit SHA.
