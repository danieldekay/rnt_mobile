# Tasks: Address Diagnosis Findings

## 1. Security Remediation

- [ ] 1.1 Add tests asserting CSP and defensive headers on worker API and asset responses.
- [ ] 1.2 Refactor `/api/wp-auth-status` to return non-session-sensitive generic status data.
- [ ] 1.3 Add tests proving auth-status output does not vary by forwarded WordPress cookie state.
- [ ] 1.4 Require explicit authenticity proof for newsletter subscribe and unsubscribe endpoints.
- [ ] 1.5 Enforce CSRF-safe behavior when `Origin` is absent or spoofed.
- [ ] 1.6 Move Sendy list identifier from plain `wrangler.toml` config to worker secret binding.
- [ ] 1.7 Remove or gate production `console.log` statements in resource parsing paths.

## 2. Performance Remediation

- [ ] 2.1 Add tests for events store filtering behavior under rapid query updates.
- [ ] 2.2 Implement debounced or throttled search updates in events filtering flow.
- [ ] 2.3 Precompute/index filter fields to avoid full heavy recomputation per interaction.
- [ ] 2.4 Memoize calendar month grid generation across unchanged month renders.
- [ ] 2.5 Memoize or precompute event-date maps used by calendar rendering.
- [ ] 2.6 Optimize map library load path to minimize repeat load overhead across visits.
- [ ] 2.7 Add bundle analysis tooling and a script for inspecting build composition.
- [ ] 2.8 Audit heavy dependencies and document keep/optimize/replace decisions.

## 3. Accessibility Remediation

- [ ] 3.1 Add a keyboard-accessible skip-to-content link in global layout and matching main-content target.
- [ ] 3.2 Make calendar dates with events open event details via keyboard (Enter/Space) and pointer.
- [ ] 3.3 Add accessible labels for map markers or an equivalent accessible event list.
- [ ] 3.4 Add modal focus management and focus trap for PWA install and update modals.
- [ ] 3.5 Ensure install and update modals declare `aria-modal="true"` with proper labeling.
- [ ] 3.6 Adjust past-date visual styles to maintain WCAG AA text contrast.

## 4. Architecture Remediation

- [ ] 4.1 Split monolithic worker logic into focused modules and compose through a single entrypoint router.
- [ ] 4.2 Split monolithic Matomo implementation into dedicated modules (config, tracking, errors/offline).
- [ ] 4.3 Define and apply clear server-vs-client filtering boundaries to avoid duplicate full-list filtering.
- [ ] 4.4 Add IP-based or equivalent worker API rate limiting with safe defaults.
- [ ] 4.5 Replace blanket client-only rendering with route-appropriate SSR/prerender configuration.

## 5. PWA Best-Practice Remediation

- [ ] 5.1 Update `static/manifest.json` with `display_override` and `prefer_related_applications: false`.
- [ ] 5.2 Add manifest screenshot entries used by install surfaces.
- [ ] 5.3 Add at least one `purpose: maskable` icon entry and verify linked asset exists.
- [ ] 5.4 Add mobile/PWA meta tags in `src/app.html` for iOS and mobile standalone support.
- [ ] 5.5 Add a dedicated offline fallback page and wire fallback behavior accordingly.
- [ ] 5.6 Add service-worker app-shell caching strategy that complements worker-side API caching.

## 6. Code Quality and Test Coverage Remediation

- [ ] 6.1 Add route-level runtime error boundaries for key views.
- [ ] 6.2 Resolve `data-validation.ts` dead-code finding by integrating or removing with parity.
- [ ] 6.3 Centralize WordPress origin configuration via shared environment-based constant.
- [ ] 6.4 Replace broad API `any` casts with explicit type guards or schema validation.
- [ ] 6.5 Add unit tests for worker routing and handler behavior.
- [ ] 6.6 Add unit tests for events store and PWA-related store logic.
- [ ] 6.7 Add API-layer tests for parsing and error-handling behavior.

## 7. Validation and Release Readiness

- [ ] 7.1 Run `npm run check` and resolve diagnostics introduced by remediation work.
- [ ] 7.2 Run `npm run build` and verify adapter-static output remains Cloudflare Pages compatible.
- [ ] 7.3 Run the targeted test suite for worker, stores, API parsing, and PWA flows.
- [ ] 7.4 Perform manual smoke checks for home, calendar, event detail, map, newsletter, and legal routes.
- [ ] 7.5 Verify install, update, and offline behavior in preview across mobile and desktop form factors.
- [ ] 7.6 Document new environment variables, secret requirements, and rollout notes in change artifacts.
