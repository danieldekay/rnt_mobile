## 1. Consent Foundation

- [x] 1.1 Add a consent state module under `src/lib/` that persists versioned consent choices for `essential`, `analytics`, and `maps`.
- [x] 1.2 Add the consent banner, settings surface, and persistent reopen action in `src/routes/+layout.svelte` and any supporting shared UI helpers.
- [x] 1.3 Add consent-aware Matomo configuration and client initialization so analytics stays off until consent and can report SPA route views, app version, and feature context.

## 2. Legal Routes And Content Loading

- [x] 2.1 Add a WordPress legal-page API module that loads `impressum`, `datenschutz`, and `cookie-richtlinie-eu` with title, canonical URL, modified date, and sanitized HTML content.
- [x] 2.2 Add the in-app legal routes and page components for Impressum, Datenschutz, and Cookie-Richtlinie with loading, success, and fallback error states.
- [x] 2.3 Update the footer and related legal navigation in `src/routes/+layout.svelte` so users can open the in-app legal pages and reopen consent settings.

## 3. Consent-Gated External Features

- [x] 3.1 Update `src/routes/+page.svelte` so the embedded list map stays blocked until map consent is granted and shows a clear placeholder with an enable action.
- [x] 3.2 Update `src/routes/event/[id]/+page.svelte` so the embedded venue map stays blocked until map consent is granted while preserving the explicit outbound map link.
- [x] 3.3 Add shared styling or helper components in `src/app.css` and `src/lib/components/` for consent placeholders, legal prose surfaces, and privacy-related notices.

## 4. Validation

- [x] 4.1 Run `npm run check` and fix any regressions introduced by the consent, legal-route, or analytics changes.
- [x] 4.2 Run `npm run build` and confirm the static build still succeeds with the new routes and consent-gated map or analytics behavior.