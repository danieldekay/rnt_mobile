## Context

The current app shell in `src/routes/+layout.svelte` has no legal navigation, no consent surface, and no privacy settings entry point. Both `src/routes/+page.svelte` and `src/routes/event/[id]/+page.svelte` initialize Leaflet and request OpenStreetMap tiles as soon as the user opens map views, which means third-party requests happen before any map-specific consent exists.

The app is fully client-rendered with `prerender = true` and `ssr = false`, so consent handling, Matomo activation, and legal-page rendering all need to work without server sessions. The legal pages already exist on the main WordPress site and are available through `wp-json/wp/v2/pages`, which makes an in-app mirror feasible without changing the existing events feed in `src/lib/api/tribe.ts`.

This change touches multiple surfaces: the app shell, two route views, a new WordPress page API module, a new consent state module, and a new Matomo client integration. It also adds privacy-sensitive behavior, so the design needs clear boundaries for when external requests are allowed.

## Goals / Non-Goals

**Goals:**
- Add a first-party consent flow for analytics and maps that works in a static SvelteKit app.
- Add mobile-readable in-app legal pages for Impressum, Datenschutz, and Cookie-Richtlinie using the canonical RNT WordPress content.
- Ensure embedded maps never request external tiles before map consent exists.
- Initialize Matomo only after analytics consent and make SPA route tracking plus app-version or feature tracking possible.
- Keep the user experience simple: one banner, one settings surface, clear legal navigation, and readable fallback states.

**Non-Goals:**
- No change to event feed loading in `src/lib/api/tribe.ts`.
- No server-side consent logging or full third-party CMP rollout.
- No change to the existing list, calendar, or event routing model beyond adding legal routes and consent-gated behavior.
- No attempt to make analytics consent-free through legal interpretation alone; the design assumes explicit opt-in for analytics.

## Decisions

### Decision: Use a first-party consent store with explicit categories
- Choice: add a dedicated consent module such as `src/lib/stores/consent.svelte.ts` that persists a versioned consent record in `localStorage` with categories for `essential`, `analytics`, and `maps`.
- Rationale: the app is static and client-rendered, so a lightweight first-party store fits the existing architecture and lets route components react to consent changes without introducing a hosted consent platform.
- Alternative considered: embed a third-party consent management platform.
- Why not: it adds more external dependencies, additional data processing concerns, and more implementation overhead than this app currently needs.

### Decision: Keep the consent UX in the app shell and reuse it from legal views
- Choice: place the initial banner and the persistent “consent settings” re-entry point in `src/routes/+layout.svelte`, and make legal pages able to open the same settings surface.
- Rationale: consent affects the whole app, not a single route, and the app shell is already where install-banner and footer controls live.
- Alternative considered: show separate consent controls inside each map-bearing route.
- Why not: it duplicates logic and makes consent harder to discover and manage later.

### Decision: Gate all embedded map loading at the route level
- Choice: keep Leaflet map UI on the home and detail routes, but do not call `initMap()` or request tile layers until `maps` consent is true; instead render a placeholder that explains the external request and offers a one-tap enable action.
- Rationale: this is the smallest change that prevents premature third-party requests while preserving the existing map UX after consent.
- Alternative considered: keep the existing auto-load behavior and rely on a general analytics-only consent banner.
- Why not: the app would still contact a third-party map service before the user had agreed.

### Decision: Mirror legal content from WordPress REST and sanitize before rendering
- Choice: add a new module, for example `src/lib/api/legal.ts`, that fetches the published WordPress pages by slug and returns title, canonical URL, modified date, and HTML content; sanitize the HTML before rendering in the new legal routes.
- Rationale: the pages already exist and are maintained on the main site, so mirroring them avoids content drift while giving the app a native legal reading flow.
- Alternative considered: link only to the main site and avoid in-app routes.
- Why not: the user explicitly wants the legal content available inside the app experience.

### Decision: Initialize Matomo through a consent-gated client utility, not a raw static snippet
- Choice: add a small Matomo client utility that loads the configured Matomo tracker only after analytics consent and listens to SvelteKit navigation changes for SPA pageview tracking.
- Rationale: a static HTML snippet is brittle in a client-routed app and makes it harder to centralize consent checks, app version tagging, and feature-event tracking.
- Alternative considered: paste the generated Matomo snippet directly into `app.html` or layout markup.
- Why not: it would either fire too early or require additional manual patching for SPA navigation.

### Decision: Pass Matomo configuration through public runtime configuration
- Choice: keep the Matomo base URL and site id in public environment variables or equivalent public config, and keep analytics disabled when those values are absent.
- Rationale: this avoids hardcoding deployment-specific values and gives a safe fallback for preview builds.
- Alternative considered: hardcode the current Matomo endpoint and site id in source.
- Why not: it complicates environment changes and makes accidental production leakage more likely.

## Risks / Trade-offs

- [The legal mirror can drift or fail if the WordPress page slugs or API availability change] → Mitigation: fetch by the known slugs, render a clear error state, and always provide the canonical external link as fallback.
- [Mirrored legal HTML can contain plugin markup that is awkward or unsafe to inject directly] → Mitigation: sanitize the HTML before rendering and constrain it to a readable legal-content wrapper.
- [A localStorage-based consent record does not create a server-side audit trail] → Mitigation: keep the scope limited to client-side enforcement for now and revisit if legal or operational requirements demand stronger proof.
- [Users may expect manual “open in maps” links to be blocked too] → Mitigation: label embedded maps as consent-gated while keeping explicit outbound links as user-initiated navigation.
- [Matomo setup details may vary between preview and production deployments] → Mitigation: use public configuration and treat missing config as “analytics unavailable,” not as an app error.

## Migration Plan

1. Add the consent state model and shell UI without enabling Matomo yet.
2. Add the legal-page API and in-app legal routes, then wire the footer to them.
3. Gate both existing map surfaces on `maps` consent.
4. Add the Matomo client utility and enable SPA tracking only when analytics consent and config are both present.
5. Validate with `npm run check` and `npm run build` because the change touches routes, layout behavior, and prerendered pages.
6. Roll back by removing the new consent and legal route changes together; with analytics config absent, the app should already degrade cleanly.

## Open Questions

- What are the exact production values for the Matomo base URL and site id that should be exposed to the app?
- Should app version and feature context be sent as Matomo custom dimensions, custom variables, or named events in the final implementation?
- Does legal want any exact banner wording copied from the source site’s existing Complianz text, or is a custom mobile-specific wording acceptable as long as the consent model matches the policy?