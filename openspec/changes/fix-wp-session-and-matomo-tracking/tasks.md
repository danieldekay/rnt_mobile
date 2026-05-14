# Tasks: fix-wp-session-and-matomo-tracking

## 1. Test Coverage for Regressions

- [ ] 1.1 Add worker auth-status tests for no-cookie, authenticated session, login-redirect, and upstream-failure states in a dedicated Worker test file.
- [ ] 1.2 Add Matomo consent-flow tests covering immediate initial pageview on consent-enabled first render and duplicate-prevention behavior.
- [ ] 1.3 Run the new tests and confirm they fail before implementation changes.

## 2. WordPress Session Status Implementation

- [ ] 2.1 Refactor `handleWordPressAuthStatus` in `worker.ts` to use wp-admin profile redirect/session detection instead of REST nonce-dependent detection.
- [ ] 2.2 Preserve `/api/wp-auth-status` response schema and existing user-facing message semantics while updating internal detection logic.
- [ ] 2.3 Keep timeout/error handling and no-store behavior intact, with `available: false` fallback on upstream failures.

## 3. Matomo Initial Tracking Fix

- [ ] 3.1 Update consent activation flow in `src/routes/+layout.svelte` to trigger Matomo sync with current URL and title on initial consent-enabled view.
- [ ] 3.2 Ensure `src/lib/matomo.ts` de-duplication (`lastTrackedUrl`) remains effective and prevents duplicate pageviews after `afterNavigate`.
- [ ] 3.3 Verify analytics-disabled or withdrawn-consent behavior still sends no tracking requests.

## 4. Verification and Quality Gates

- [ ] 4.1 Re-run worker and Matomo tests to confirm green after implementation.
- [ ] 4.2 Run `npm run check` and resolve any type or Svelte diagnostics.
- [ ] 4.3 Perform a manual smoke check of sidebar WordPress status and first-view Matomo hit behavior in a browser session.
