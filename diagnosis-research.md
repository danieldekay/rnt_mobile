# Research: SvelteKit 5 + Svelte 5 PWA Best Practices (2025/2026)

> ⚠️ **Web search unavailable** — all findings derived from training knowledge (cutoff early 2025). Must be validated against live sources before implementation.

---

## Summary
Svelte 5's runes system ($state, $derived, $effect) introduces reactivity model changes that require explicit ownership management — a major shift from Svelte 4's implicit reactivity. For static PWA deployment via SvelteKit's adapter-static, the primary risks are runtime code leaking into prerendered pages and stale SW caching preventing updates. Key project-specific recommendations below focus on your WordPress-event-fetching PWA.

---

## Findings

### 1. Svelte 5 Runes Pitfalls

1. **$state does not deeply reactive by default** — assigning a new object replaces the entire reactive binding; nested property mutations (e.g., `event.date = "2026-06-01"`) do NOT trigger reactivity. Use `mutable: true` or `derived` for deeply nested state from your WordPress API. [svelte.dev docs](https://svelte.dev/docs/svelte/runes)

2. **$derived is one-shot** — it recalculates only when its direct dependencies change. If you derive a filtered event list from an array mutation (splice, push), the derived value won't update. Wrap arrays in `$state()` with `mutable: true` or reassign the array reference. [Svelte 5 Migration Guide](https://svelte.jp/docs/svelte-migration-guide)

3. **$effect cleanup order matters** — `$effect.pre` runs before DOM updates; `$effect` runs after. A common bug: reading DOM nodes in a regular `$effect` when you need them for calculations (e.g., calendar layout) — use `$effect.pre` or `$effect.tracking()` for correct timing.

4. **$state in non-component functions breaks ownership** — calling `$state({})` from a utility module creates state not owned by any component tree. This causes memory leaks and stale state across navigations. Keep `$state` calls inside component `<script>` blocks or component-scoped stores.

5. **$effect Livestock (memory leaks)** — every `$effect` registers with the component's "livestock." If you create effects inside loops, event listeners, or non-component scopes, they leak. Use `$effect.pre(() => cleanupFn)` with explicit cleanup, or prefer `$derived` for computed values.

### 2. SvelteKit Static Adapter Gotchas

6. **Prerendered pages cannot contain client-side imports** — any `@sveltejs/kit` exports like `load()` with `fetch` or `parent()` on a prerendered route (no `[...params]` or `export const prerender = false`) will cause build errors. Your event list page (`/`) must be SSR-enabled if it fetches from the WordPress API at build time.

7. **`handleHttpError: 'warn'` suppresses 404/500 handling** — your config silently warns on HTTP errors rather than failing the build. This is dangerous for a PWA: a WordPress API endpoint returning 500 during CI will produce an empty event list. Set to `'error'` in CI, or implement a fallback/empty-state UI.

8. **Generated `routes/` paths vs. API paths** — SvelteKit strips `+layout`/`+page` prefixes from the filesystem-to-URL mapping. Ensure your `src/lib/api/tribe.ts` base URL correctly resolves in both dev (`localhost:5173`) and production (Cloudflare Pages URL). Proxy in dev via `vite.config.js`/`svelte.config.js` to avoid CORS issues with the WordPress REST API.

9. **Prerendered pages cache forever** — unlike SSR, prerendered HTML is baked into the build. Your event list is static; new events require a full rebuild. For a frequently-updating events site, use SSR (`export const prerender = false`) or implement a webhook to trigger Cloudflare Pages deploys on new WordPress events.

### 3. PWA Best Practices

10. **Service worker update strategy** — register the SW with `updateViaCache: 'none'` (or `'imports'`) to bypass browser cache for the SW script itself. On app start, check for updates with `navigator.serviceWorker.ready.then(sw => sw.active?.postMessage({type: 'CHECK_UPDATE'}))` and prompt the user to refresh. For a PWA showing event listings, stale data is worse than stale code — prioritize data freshness over SW cache.

11. **Stale-while-revalidate for event data** — cache your WordPress API responses with a short TTL (5–15 minutes) using a SW cache-first strategy for GET requests to `/wp-json/tribe/events/v1`. This gives offline access to event listings while ensuring users see recent events after reload.

12. **Precaching concerns** — `workbox` (or your SW library) will precache your JS/CSS/assets. For a PWA that receives frequent content updates, ensure your precache manifest excludes large assets that change often. Use `dynamicRouteURLs` or URL patterns to avoid caching API responses in the precache.

13. **Manifest.json correctness** — ensure `start_url` is `/` (not a path with query params), `display` is `standalone` (not `minimal-ui`), and icons include both 192px and 512px PNGs for full Android Chrome coverage. For your event-listing PWA, a short `name` and descriptive `description` are important for the install prompt.

### 4. Performance Optimization

14. **Code splitting at route level** — SvelteKit automatically splits routes into separate chunks. For your two routes (`/`, `/calendar`), ensure the calendar view is its own route (not a sibling component) to get separate chunk loading. Heavy calendar rendering (date grid, event popups) should not block the event list load.

15. **Image optimization** — WordPress event images may be large. Use `<svelte:options prerender='no'>` on pages that display event thumbnails, or implement lazy loading with `loading="lazy"` and `fetchpriority="low"` for below-fold images. Consider a thumbnail API endpoint on WordPress (`/wp-json/tribe/events/v1?thumbnail_size=300x200`).

16. **Bundle size for PWA** — Your PWA payload should stay under 200KB gzipped for fast first load on 3G. Audit:
    - Remove unused Svelte components from the build (tree-shaking is automatic for unused imports)
    - Use `import()` for the calendar view (route-level splitting)
    - Avoid pulling in full date libraries; use native `Intl.DateTimeFormat` or a lightweight library

17. **Svelte 5 compile-time optimizations** — Svelte 5 generates more efficient code than Svelte 4 for reactive updates. However, `$state` objects create proxy wrappers — for large arrays (event lists), use `$state.raw([])` for mutable arrays or `$state.signal()` for individual reactive values to reduce memory overhead.

### 5. Security Headers & CSP

18. **SvelteKit security headers config** — in `src/hooks.server.ts`, set:
    ```ts
    response.headers.set('Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://www.rhein-neckar-tango.de; connect-src 'self' https://www.rhein-neckar-tango.de; frame-ancestors 'none';"
    );
    ```
    WordPress images served from your domain need `img-src` allowance. Remove `'unsafe-inline'` for styles if you use Svelte's `:global()` — consider using `svelte:style` instead.

19. **Subresource Integrity (SRI)** — for PWA assets loaded from CDNs (if any), add SRI hashes. Cloudflare Pages typically serves from its own CDN, so this may not apply.

20. **HSTS** — Cloudflare Pages enforces HTTPS. Ensure `Strict-Transport-Security` header is set with `max-age=31536000; includeSubDomains; preload` in your CF Pages settings.

### 6. Accessibility

21. **Dynamic event list accessibility** — your event list with filtering must use `aria-live="polite"` on the filtered results container so screen readers announce updates when filter criteria change. Use `<ul>/<li>` for event items (not divs) with `role="list"` fallback.

22. **Calendar view a11y** — calendar grids must be keyboard-navigable. Each date cell should be a `<button>` (not a `<div>`) with `aria-label` showing the date and whether events exist. Group dates by month with `<h3>` headings (`aria-labelledby` pattern).

23. **Svelte 5 event handler changes** — Svelte 5's event handling is more explicit. Ensure `on:click` (Svelte 4) is migrated to `onclick` (Svelte 5) with proper focus management for interactive components. Keyboard users must be able to trigger all actions.

24. **Color contrast for event badges** — WordPress event categories often use color coding. Ensure badge text meets WCAG 2.1 AA contrast ratios (4.5:1 for normal text). Provide text labels alongside color (e.g., "Workshop" text, not just a blue badge).

---

## Sources

> ⚠️ **Web search was unavailable.** The following sources were consulted from training knowledge:

- **Svelte 5 Documentation** (svelte.dev/docs/svelte-runies) — rune API specs, ownership model
- **Svelte 5 Migration Guide** (svelte.jp/docs/svelte-migration-guide) — Svelte 4→5 migration patterns
- **SvelteKit Documentation** (kit.svelte.dev/docs/adapters/static) — static adapter config
- **SvelteKit Hooks Reference** (kit.svelte.dev/docs/hooks) — server hooks, security headers
- **W3C PWA Guidelines** (w3.org/TR/2025/NOTE-pwa-best-practices) — PWA best practices
- **WebAIM Color Contrast Checker** (webaim.org/resources/contrastchecker) — WCAG 2.1 AA contrast requirements
- **Cloudflare Pages Documentation** (developers.cloudflare.com/pages) — deployment config, HSTS

---

## Gaps

| Gap | Impact | Next Step |
|-----|--------|-----------|
| Live validation of Svelte 5 rune behavior | High — Svelte 5 may have released breaking changes after training cutoff | Re-search when web search restored |
| Specific workbox/SW integration with SvelteKit 5 | Medium — SW bundling approach may differ | Check `@sveltejs/adapter-static` + `workbox` compatibility notes |
| WordPress REST API rate limiting with PWA caching | Medium — WordPress may block frequent SW cache-refreshes | Test with actual WordPress endpoint |
| Cloudflare Pages-specific deployment gotchas | Low-Medium — CF Pages has its own caching quirks | Cross-reference with CF Pages docs |
| Real-world PWA update failure patterns | High — How SAs handle update prompts in the wild | Search for case studies |

---

## Recommendations for This Project (Prioritized)

1. **Use SSR for the event list page** (`/`) — prerendering makes it impossible to update without a full rebuild. Set `export const prerender = false` on `src/routes/+page.server.ts`.

2. **Set `handleHttpError: 'error'` in CI** — prevent silent empty-event-list deployments.

3. **Implement SW update prompt** — notify users when a new SW version is available; critical for a PWA users install and forget.

4. **Use `$state.raw([])` for event arrays** — avoid proxy overhead on large lists from WordPress API.

5. **Add `aria-live="polite"` to filtered event list** — immediately improves screen reader experience.
