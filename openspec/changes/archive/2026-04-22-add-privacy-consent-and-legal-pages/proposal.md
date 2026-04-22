## Why

The app currently has no consent management, no in-app legal pages, and it loads third-party map tiles as soon as a user opens map views. That blocks a GDPR-conform rollout of Matomo analytics and leaves privacy-sensitive features harder to explain and control inside the mobile app.

## What Changes

- Add a consent system with explicit categories for essential storage, analytics, and maps so non-essential processing stays off until the user opts in.
- Add an always-available consent settings entry point in the app shell so users can review or withdraw consent later.
- Add in-app legal pages for Impressum, Datenschutzerklärung, and Cookie-Richtlinie by mirroring the canonical RNT WordPress pages via REST while preserving the canonical source links.
- Gate embedded maps on the home page and event detail page behind map consent, showing a readable placeholder and manual enable action until consent is granted.
- Prepare Matomo integration so it initializes only after analytics consent and can track app version, route views, and key feature usage in a privacy-controlled way.

## Capabilities

### New Capabilities
- `privacy-consent`: Defines the consent banner, consent categories, preference management, and analytics activation rules for the app.
- `legal-pages`: Defines the in-app legal routes, REST-backed legal content loading, and canonical source-page linking.

### Modified Capabilities
- `home-event-browsing`: Changes map-view behavior so the home map remains blocked until map consent is granted and explains how to enable it.
- `event-detail`: Changes venue-map behavior so the embedded event map remains blocked until map consent is granted while preserving the outbound map link.

## Impact

- Affected routes and views include `src/routes/+layout.svelte`, `src/routes/+page.svelte`, `src/routes/event/[id]/+page.svelte`, and new legal routes for the mirrored pages.
- Affected modules likely include a new consent store, a new WordPress legal-page API module, and a Matomo client utility; existing event fetching in `src/lib/api/tribe.ts` remains unchanged.
- API impact: the app will read published WordPress pages from `wp-json/wp/v2/pages` for `impressum`, `datenschutz`, and `cookie-richtlinie-eu`; if a page is unavailable, the app must fall back to the canonical external URL.
- Deployment impact: the app remains fully static and client-rendered, and the consent and Matomo flow must stay compatible with prerendering and Cloudflare-hosted static assets.