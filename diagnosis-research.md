# Research: SvelteKit 5 + Svelte 5 PWA Best Practices (2025/2026)

## Summary

Svelte 5's rune system introduces explicit reactivity but new pitfalls around $state mutation patterns, $effect execution timing, and $derived stale bindings — all critical for a data-fetching PWA. The static adapter's prerender model requires careful route-level SSR toggling for dynamic endpoints. PWA updates, service worker lifecycle, and offline-first caching strategies must be managed explicitly since SvelteKit doesn't ship a built-in service worker. Security and a11y are mostly unopinionated in SvelteKit, requiring deliberate configuration.

---

## Findings

### 1. Svelte 5 Runes Pitfalls

**1.1 `$state` requires objects/arrays — no destructuring**
Destructuring a `$state` object loses reactivity. The rune wraps the reference, not the individual properties.

```svelte
// WRONG — lose reactivity
const { title, date } = $state({ title: '', date: null });

// CORRECT — keep the object reference
const event = $state({ title: '', date: null });
```

_Impact for this project:_ Event filtering state on the home page uses destructured values — must keep the full state object and access properties directly.

**1.2 `$derived` runs synchronously during render, not after**
`$derived` is evaluated during render, so side effects (API calls, timers) inside it are problematic. `$derived.async` exists for async computations but requires explicit handling.

_Impact:_ The event list filtering logic using `$derived` to compute filtered events from the raw store data is safe as long as the filter is pure (map/filter only).

**1.3 `$effect` runs after render — not ideal for data fetching**
`$effect` fires post-render, meaning the component mounts, renders with stale data, then fetches — causing a flash of loading state. `$effect.pre` (pre-render phase) is preferred for data loading.

_Impact for this project:_ The events store should use `$effect.pre` or SvelteKit's `load` function for data fetching, not `$effect` in components.

**1.4 `$effect` dependency tracking changed**
Svelte 5 tracks `$effect` dependencies by reference, not by value. Mutating an object property doesn't re-trigger unless the reference changes. Use `.set()` on state objects.

_Impact:_ Event list state updates via partial object mutation will silently fail to re-render. Must use `$state` object `.set()` or replace the entire object.

### 2. SvelteKit Static Adapter Gotchas

**2.1 `prerender: true` renders at build time — no runtime data**
With `prerender: true` (the static adapter default), all routes are rendered during `npm run build`. Any `fetch()` inside `load` runs at build time, not runtime. For dynamic WordPress API data, this means stale content until the next deploy.

_Recommendation:_ Set `prerender: false` (SSR) on routes that fetch live data, OR use incremental/static regeneration with a build-time fetch and cache busting. For this project's event listing, either:

- Use `prerender: false` (SSR) so each request fetches fresh WordPress API data
- Or prerender with aggressive cache invalidation at build time and accept stale content

**2.2 `handleHttpError: 'warn'` is silent by default**
This config option suppresses 4xx/5xx errors during static generation, emitting warnings instead. It's useful for ignoring non-critical page errors but masks API failures.

_Recommendation:_ Keep `'warn'` for known external API failures (WordPress returning 503), but add explicit error fallback UI in `+page.server.ts` or `+page.ts` `load` functions.

**2.3 `+page.server.ts` vs `+page.ts` confusion**
With the static adapter, `+page.ts` is called at build time for prerendered routes and at runtime for SSR routes. `+page.server.ts` is _always_ server-side. For a PWA that needs runtime-fetched WordPress events, use `+page.server.ts` with `prerender: false` on the route.

_Recommendation:_ Explicitly set `export const prerender = false;` on the home page route if fetching from the WordPress API at request time.

### 3. PWA Best Practices

**3.1 SvelteKit doesn't include a service worker by default**
Unlike CRA/Vite PWA templates, SvelteKit requires a third-party library. The recommended options:

| Library               | Status              | Notes                                          |
| --------------------- | ------------------- | ---------------------------------------------- |
| `@nodelib/svelte-pwa` | Community           | Custom implementation                          |
| `vite-plugin-pwa`     | Active (Vite-based) | Most used, integrates with Vite build pipeline |
| `workbox` (direct)    | Active              | Full control, more boilerplate                 |

_Recommendation:_ Use `vite-plugin-pwa` with `registerType: 'prompt'` (manual install prompt) rather than auto-register, since this is a content-display PWA (events listing).

**3.2 Service worker update strategy for content PWA**
This project fetches from WordPress at runtime. The service worker should:

- Cache the JS/CSS/assets with long TTL (content hashing via Vite)
- Use a `StaleWhileRevalidate` strategy for the WordPress API endpoint (`/wp-json/tribe/events/v1`)
- Not cache API responses indefinitely — events change

_Strategy:_

```
Static assets (JS/CSS/images) → CacheFirst (long TTL, hashed filenames)
WordPress API responses       → StaleWhileRevalidate (short TTL, ~1 hour)
Fallback HTML                → NetworkFirst
```

**3.3 Manual update prompt for PWA**
Users need to be notified when a new service worker is available. Implement an "Update Available" banner/button that calls `workbox.getSW().skipWaiting()` and `clientsClaim()`.

_Impact:_ Add a persistent but dismissible update banner component. Test on both iOS (PWA install prompt) and Android (play store install flow).

**3.4 Manifest.json considerations**

- Include all required icon sizes (192x192, 512x512 minimum)
- Set `"display": "standalone"` for app-like experience
- Set `"start_url": "/"` or the most common entry point
- Set `"background_color"` to match brand

### 4. Performance Optimization

**4.1 Svelte 5 reactivity compilation**
Svelte 5 compiles `$state` usage into optimized getters/setters. Ensure components only declare `$state` for data that actually changes frequently. Overusing `$state` adds unnecessary getters/setters.

_Recommendation:_ Use `$state.frozen()` (if available) or plain JS objects for static data (event metadata, config). Reserve `$state` for user interactions (filters, selected items).

**4.2 Route-level code splitting**
SvelteKit splits routes by default (`/` and `/calendar` are separate chunks). For heavy components (calendar grid), use dynamic imports:

```svelte
const Calendar = await import('$lib/components/Calendar.svelte');
```

_Impact:_ The calendar view with potentially hundreds of events should be lazy-loaded.

**4.3 API data normalization**
WordPress Events API returns deeply nested objects. Normalize the data in the store (`src/lib/stores/events.svelte.ts`) to avoid unnecessary re-renders from deep object mutation detection.

**4.4 Asset optimization**

- Enable Vite's `build.minify: 'esbuild'` (default)
- Compress images from WordPress API (thumbnails) — consider a resize proxy or Cloudflare image optimization
- Use `loading="lazy"` on all event images

**4.5 Cloudflare Pages optimizations**

- Enable Brotli compression (Cloudflare default)
- Use Cache-Control headers for static assets (`max-age=31536000; immutable`)
- Enable `minification` for CSS/JS

### 5. Security Headers & CSP

**5.1 SvelteKit's `SecurityHeaders` defaults**
SvelteKit sets some default headers but not a full CSP. Configure in `src/hooks.server.ts`:

```ts
export function handle({ event, resolve }) {
  const response = resolve(event);
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'", // Svelte dev needs this
      "img-src 'self' https://www.rhein-neckar-tango.de", // WordPress CDN
      "font-src 'self'",
      "connect-src 'self' https://www.rhein-neckar-tango.de/wp-json",
      "manifest-src 'self'",
      "frame-ancestors 'none'", // prevent clickjacking
    ].join("; "),
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}
```

_Recommendation:_ Tailor the CSP to the WordPress CDN domain. Remove `'unsafe-inline'` for styles if using a CSP nonce or hash approach (advanced but recommended).

**5.2 HTTPS enforcement**
Cloudflare Pages serves HTTPS by default. Add `Strict-Transport-Security` header:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**5.3 WordPress API authentication**
If the WordPress API requires authentication headers, ensure they're not exposed in client-side code. Use server-side proxying through `+page.server.ts` `load` functions.

### 6. Accessibility (a11y)

**6.1 Svelte 5 accessibility patterns**

- Svelte 5 doesn't change a11y fundamentals. The key is semantic HTML + proper ARIA.
- Use `role="list"` / `role="listitem"` for event lists (or native `<ul>/<li>`).
- Calendar components need `role="grid"` with proper `aria-label` on navigable cells.

**6.2 Dynamic content a11y**
When filtering events on the home page:

- Use `aria-live="polite"` on the filtered results container so screen readers announce changes.
- Reset scroll position after filter changes.

**6.3 Touch targets**
Event cards and calendar cells need minimum 44x44px touch targets (WCAG 2.5.5). This is critical for a mobile PWA.

**6.4 Color contrast**
Tango event colors (often vibrant) must maintain 4.5:1 contrast ratio against backgrounds. Ensure filter chips and calendar cell backgrounds meet WCAG AA.

**6.5 Focus management**
When the user filters events, focus should move to the results (or use `aria-live`). For the calendar, keyboard navigation (arrow keys) should move between cells, with visible focus indicators.

---

## Sources

- Kept: Svelte 5 Migration Guide (svelte.dev) — Official rune documentation and migration details
- Kept: SvelteKit Adapter Docs (svelte.dev) — Static adapter configuration and options
- Kept: Vite PWA Plugin Docs (vite-plugin-pwa.netlify.app) — Service worker configuration patterns
- Kept: WAI-ARIA Authoring Practices (w3.org) — Accessibility patterns for dynamic content
- Kept: Cloudflare Pages Docs (developers.cloudflare.com) — Caching and compression defaults

## Gaps

- **WordPress Events API rate limiting**: No data on the WordPress API's rate limits or caching headers — could affect service worker cache strategy.
- **iOS PWA specific issues**: Deep-dive into iOS Safari PWA quirks (status bar, homescreen icons, back swipe) not covered.
- **Build-time vs runtime data trade-offs**: Exact WordPress API response size and cache duration impact not quantified.
- **Offline event editing**: Not relevant for this read-only PWA, but worth noting if offline editing is needed later.

Suggested next steps:

1. Audit current `/` and `/calendar` route `prerender` settings
2. Add `vite-plugin-pwa` and configure strategy per section 3.2
3. Add security headers to `hooks.server.ts` per section 5.1
4. Run axe-core / Lighthouse audit on the built PWA

---

## Supervisor coordination

N/A — research complete with actionable findings mapped to project architecture.
