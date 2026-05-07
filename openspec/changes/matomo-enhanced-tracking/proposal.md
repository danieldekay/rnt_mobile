# Proposal: Matomo Error Tracking + Enhanced Analytics

## Why

rnt_mobile currently has a basic Matomo integration that tracks page views but lacks:
1) **Error tracking** — production errors silently fail (no Matomo events fire)
2) **Event analytics** — no tracking of user actions (filter toggles, share, calendar)
3) **Display mode awareness** — cannot distinguish PWA vs browser installs in Matomo
4) **Performance metrics** — no LCP/FID/CLS tracking for mobile performance

Adding error tracking + enhanced analytics enables data-driven decisions about PWA adoption,
event discovery patterns, and feature improvements.

## What Changes

- MODIFIED — `src/lib/matomo.ts`: Add error tracking, event analytics functions, display mode
  detection, performance tracking (LCP, FID, CLS)
- NEW — `src/lib/matomo/errors.ts`: Error tracking module with `trackError(error)` function
- NEW — `src/lib/matomo/performance.ts`: Performance monitoring with `trackPerformance()`
- MODIFIED — Route pages: Add event tracking (filter toggles, share, save, map toggle)
- NO new dependencies — All tracked via existing Matomo SDK

### Capabilities

#### New Capabilities
- `matomo-error-tracking`: Track uncaught errors, fetch errors, JS errors, Matomo send failures
- `matomo-event-analytics`: Track user actions (filter toggles, share, event detail views)
- `matomo-performance`: Track LCP (Largest Contentful Paint), FID (First Input Delay), CLS
- `matomo-display-mode`: Track PWA display mode (standalone, browser, fullscreen)

#### Existing Capabilities (Enhanced)
- `matomo-offline-queue`: Already exists — now with error tracking + event analytics
- `matomo-heartbeat`: Already exists — now with performance metrics per heartbeat

## Impact

- `src/lib/matomo.ts`: Enhanced with error tracking, event analytics, performance
- `src/lib/matomo/errors.ts`: New error tracking module
- `src/lib/matomo/performance.ts`: New performance monitoring module
- `src/routes/+layout.svelte`: Add route change tracking + display mode tracking
- `src/routes/+page.svelte`: Add filter toggle tracking, map toggle
- `src/routes/calendar/+page.svelte`: Add calendar view events
- `src/routes/events/[id]/+page.svelte`: Add share/save/calendar tracking
- `src/lib/matomo/offline.ts`: Now includes error events in queue
- No API endpoint changes
- No auth changes (error data is first-party, no PII)
