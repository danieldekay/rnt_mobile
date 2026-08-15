---
type: Feature
title: PWA System
description: Progressive Web App capabilities — installability, offline support, update management, and service worker architecture.
tags: [pwa, service-worker, install, offline, manifest]
sources:
  - id: inventory
    resource: /sources/INVENTORY.md
    title: RNT Mobile Project Inventory
  - id: agents
    resource: /sources/AGENTS.md
    title: AGENTS.md
  - id: pwa-results
    resource: /sources/pwa-results.md
    title: PWA Results
  - id: pwa-install
    resource: /sources/pwa-how-to-install-and-update.md
    title: PWA Install & Update Guide
generated: { by: agent/copilot, at: 2026-07-25T21:10:00Z }
status: stable
---

# PWA System

RNT Mobile is a Progressive Web App (PWA) with installability, offline support, and automatic update management.

## PWA Manifest

`manifest.json` (generated from `src/app.html`):
- App name: "RNT Kalender"
- Short name: "RNT"
- Display: `standalone`
- Theme color: primary-600
- Background color: neutral-50
- Icons: 192x192, 512x512 (maskable)
- Apple touch icon: 180x180

## Install Flow

### beforeinstallprompt

The `pwaInstallStore` captures the `beforeinstallprompt` event and provides:
- `deferredPrompt` — the browser's install prompt
- `platform` detection (`standalone`, `minimal-ui`, `fullscreen`, `browser`)
- Modal control for custom install UI

### Install Components

| Component | Purpose |
|-----------|---------|
| `PwaInstallButton` | Header CTA — opens modal or triggers native prompt |
| `PwaInstallModal` | Browser-specific installation instructions + native prompt trigger |

### Install Triggers

1. **Native prompt** — if browser supports automatic install prompt
2. **Custom modal** — browser-specific instructions (iOS Safari, Android Chrome, Desktop)

## Update Management

### Update Detection

SvelteKit exposes `$app/state.updated` when a new version is deployed. The `pwaUpdateStore`:
- Syncs with SvelteKit's `updated` state
- Shows update banner when new version available
- Provides recovery flow if update check fails

### Update Components

| Component | Purpose |
|-----------|---------|
| `PwaUpdateBanner` | Update available / update-check-failed banner |

### Update Flow

1. New deploy → service worker detects new version
2. SvelteKit `updated` state becomes `true`
3. `PwaUpdateBanner` shows "Update available" prompt
4. User clicks → reload activates new service worker

## Service Worker

`src/service-worker.ts` handles:
- Precaching of app shell assets
- Runtime caching of API responses (stale-while-revalidate)
- Offline fallback page
- Push notifications (if enabled)

## Offline Support

- App shell cached for offline access
- API responses cached with stale-while-revalidate strategy
- Offline fallback page when no cached data available
- Events list shows cached data when offline

## PWA Results

From `pwa-results.md`:
- Lighthouse PWA score: 100
- Installable on all platforms
- Offline functionality verified
- Update flow tested

## Cross-References

- [Architecture](/concepts/architecture.md) — system-level structural decisions
- [Component System](/concepts/component-system.md) — PWA install/update components
- [Deployment Pipeline](/concepts/deployment-pipeline.md) — how updates are deployed
