# Design: Matomo Enhanced Error Tracking + Analytics

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│      +layout.svelte → initializes all trackers                       │
│   +layout.svelte → initializes Matomo error tracking         │
│   +page.svelte → tracks filters, map, images                │
│  events/[id]/+page.svelte → tracks share, save, calendar    │
└──────────────────────┬──────────────────────────────────────┘
                        │
┌──────────────────────▼──────────────────────────────────────┐
│                  src/lib/matomo/                    │
│                                                                │
│  export function trackError(error: Error)                      │
│  export function trackEvent(category: string, action: string) │
│  export function trackPageView(url: string, title: string)    │
│  export function getDisplayMode(): string                      │
│  export function trackLcp()                                    │
│  export function trackFid()                                    │
│  ...                                                           │
└──────────────────────┬──────────────────────────────────────┘
                        │
┌──────────────────────▼──────────────────────────────────────┐
│                    Matomo Server                               │
│  POST /matomo.php?category=errors&action=uncaught           │
│  POST /matomo.php?category=actions&action=filter_toggle     │
│  POST /matomo.php?category=performance&lcp=2.5&fid=50       │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### `src/lib/matomo/errors.ts` (New)

Error tracking module. Captures all JavaScript errors and sends to Matomo.

```typescript
// Key exports
export function trackError(error: Error, context?: string): void;
export function setupErrorTracking(): void;
export function trackFetchError(url: string, status: number): void;
export function trackComponentError(component: string, error: Error): void;

// Internal state
let errorCounter = 0;
let maxErrorsPerSession = 10;
```

### `src/lib/matomo/analytics.ts` (New)

Event and route tracking.

```typescript
// Key exports
export function trackEvent(
  category: string,
  action: string,
  label?: string,
): void;
export function trackRouteChange(from: string, to: string): void;
export function trackRouteView(route: string, title: string): void;
export function trackFilterToggle(filter: string, active: boolean): void;
export function trackShareAction(eventId: number): void;
export function trackEventDetailView(eventId: number): void;

// Internal state
let currentRoute = "";
```

### `src/lib/matomo/display-mode.ts` (New)

Display mode detection and tracking.

```typescript
// Key exports
export function getDisplayMode():
  | "standalone"
  | "browser"
  | "fullscreen"
  | "minimal-ui";
export function setupDisplayModeTracking(): void;
export function trackDisplayMode(mode: string): void;

// Internal state
let currentMode = "browser";
let modeChangeCounter = 0;
```

### `src/lib/matomo/performance.ts` (New)

Performance metrics tracking.

```typescript
// Key exports
export function trackLcp(): number;
export function trackFid(): number;
export function trackCls(): number;
export function trackAllPerformance(): void;
export function setupPerformanceTracking(): void;

// Internal state
let lcpValue = 0;
let fidValue = 0;
let clsValue = 0;
```

## Data Flow

1. **Route Mount**: `+layout.svelte` initializes all trackers on mount
2. **User Action**: Page calls `trackFilterToggle('milonga', true)`
3. **Queue Write**: `src/lib/matomo-offline.ts` stores in queue
4. **Retry**: On `online` event, retries all pending events
5. **Consent Check**: All Matomo calls gated by consent
6. **Error Detection**: Global error handler catches uncaught errors
7. **Performance**: LCP/FID/CLS tracked via `PerformanceObserver`

## Error Handling

- Max 10 errors per session (prevent flooding Matomo)
- Errors silently swallowed (no user-facing alerts)
- Errors include: type, message, timestamp, display mode, URL
- No user PII in errors (sanitize error messages)
- Heartbeat still fires (separate from error tracking)
- Queue limited to 50 events (drop oldest if exceeded)

## Testing

### Unit Tests

- `tests/matomo/errors.test.ts`: trackError, setupErrorTracking
- `tests/matomo/analytics.test.ts`: trackEvent, trackFilterToggle
- `tests/matomo/display-mode.test.ts`: getDisplayMode, trackDisplayMode
- `tests/matomo/performance.test.ts`: trackLcp, trackAllPerformance

### Manual Tests

- View /, /events, /calendar → check views in Matomo
- Toggle filters → check events in Matomo
- Click share → check events in Matomo
- Install PWA → check display mode in Matomo
- Force offline → verify queue, reconnect → verify flush
