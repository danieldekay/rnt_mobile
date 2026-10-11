# Safari bookmark update recovery

## Problem

Installed Safari/bookmark clients can continue to show an old app shell even after a successful deploy. Private browsing works because it bypasses the persistent Service Worker and Cache API state.

The live Service Worker precached `/` and handled cache-first app-shell assets before navigation requests. A bookmark to `/` could therefore be served from the old `rnt-cache-*` cache before the updated app code had a chance to run.

## Change

- Navigation requests are handled before app-shell asset cache checks.
- `/` is no longer treated as a cache-first app-shell asset.
- Root and generated HTML documents are sent with `no-store` headers.
- Service Worker and SvelteKit version metadata are sent with explicit `no-store, no-cache, must-revalidate` headers.

## Compatibility note

This prevents future Safari/bookmark launches from remaining pinned to a stale shell after the new Service Worker is installed. Clients already controlled by the previous broken Service Worker may still need one manual cache-busting navigation, for example opening `/?appUpdate=<timestamp>`, because that old Service Worker is already running on the device.
