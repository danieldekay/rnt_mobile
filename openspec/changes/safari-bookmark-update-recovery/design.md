# Design

## Diagnosis

Private browsing works because it has no existing Service Worker or Cache API state. Safari bookmark/PWA launches can fail because the previous Service Worker can serve the cached `/` document before the network, so the browser keeps booting the old JavaScript bundle.

## Design decision

Navigation requests must be handled before app-shell asset matching. The app may still precache non-navigation shell assets, but HTML entry documents must remain network-first.

This is deliberately more important than offline-first behavior for `/`: offline fallback remains available through the dedicated navigation fallback path and `/offline` page.

## One-time recovery limitation

A Service Worker already installed on a device cannot be retroactively changed until the browser fetches the new Service Worker script or the user performs a cache-busted navigation. This change prevents the same class of bug after the hotfix has reached the device; it cannot remotely alter the old running Service Worker.
