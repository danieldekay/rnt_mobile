---
type: Feature
title: Analytics
description: Matomo analytics integration with GDPR consent management, offline queueing, and PWA-specific tracking dimensions.
tags: [analytics, matomo, gdpr, consent, tracking]
sources:
  - id: inventory
    resource: /sources/INVENTORY.md
    title: RNT Mobile Project Inventory
  - id: matomo-pwa
    resource: /sources/matomo-pwa.md
    title: Matomo PWA Documentation
  - id: deploy
    resource: /sources/DEPLOY.md
    title: Deployment Guide
generated: { by: agent/copilot, at: 2026-07-25T21:10:00Z }
status: stable
---

# Analytics

RNT Mobile uses Matomo analytics with GDPR-first consent management and PWA-specific tracking.

## Matomo Configuration

Configured via `wrangler.toml` `[vars]`:

| Variable | Value | Purpose |
|----------|-------|---------|
| `PUBLIC_MATOMO_URL` | `https://statistics.tangoparty.net` | Matomo endpoint |
| `PUBLIC_MATOMO_SITE_ID` | `15` | Site ID for tracking |

Values are embedded in the client bundle via `$env/dynamic/public`.

## Consent-Gated Tracking

Matomo only loads after the user grants **analytics consent** via the consent banner. The `consentStore` manages:

- **Essential** — always on (no tracking)
- **Analytics** — Matomo tracking (opt-in)
- **Maps** — OpenStreetMap tiles (opt-in)

If consent is not granted, the Matomo module stays dormant and no requests are made.

## Tracked Dimensions

### PWA-Specific Custom Dimensions

| Dimension | Values | Purpose |
|-----------|--------|---------|
| `display_mode` | `standalone`, `minimal-ui`, `fullscreen`, `browser` | Split PWA-installed vs browser usage |
| `app_version` | version string | Release regression attribution |

### Tracked Events

- Page views (on route change)
- Feature events (filter usage, search, map toggle)
- Install events (PWA installed)
- Update events (PWA updated)

## Offline Queue

`src/lib/matomo.ts` implements an offline queue via `localStorage`:

1. When offline, events are queued in `localStorage`
2. When back online, queued events are sent to Matomo
3. Queue is cleared after successful send

## Implementation

```typescript
// src/lib/matomo.ts
trackPageView()      // Track page view with custom dimensions
trackFeatureEvent()  // Track feature usage events
syncMatomoConsent()  // Sync consent state with Matomo
```

## GDPR Compliance

- No tracking before consent
- Consent stored in `localStorage` (persisted)
- Consent can be withdrawn at any time
- No PII collected (anonymized IP)
- Data hosted on self-hosted Matomo instance

## Cross-References

- [Architecture](/concepts/architecture.md) — system-level structural decisions
- [Component System](/concepts/component-system.md) — consent banner component
- [Deployment Pipeline](/concepts/deployment-pipeline.md) — Matomo config in wrangler.toml
