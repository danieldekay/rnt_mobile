# Proposal: Fix WP Session and Matomo Tracking

## Why

WordPress login status in the sidebar reports users as logged out even with an active wp-admin session, and Matomo appears non-functional in real usage because the first consented page load may not emit a pageview. This blocks editor workflows and undermines analytics trust.

## What Changes

- Replace Worker-side WordPress auth detection with a session check that works without REST nonce requirements and correctly distinguishes authenticated vs redirected-to-login states.
- Keep the `/api/wp-auth-status` contract stable (`loggedIn`, `available`, `message`, `loginUrl`, `adminUrl`) while improving reliability and timeout/error behavior.
- Ensure Matomo sends an initial pageview immediately when analytics consent is enabled, not only after a later SPA navigation.
- Add focused verification coverage for WordPress auth states and Matomo initial tracking behavior.

## Capabilities

### New Capabilities

- `wordpress-session-status`: Provides a robust WordPress admin session-status capability for the mobile shell, including correct login detection and actionable fallback messaging.

### Modified Capabilities

- `privacy-consent`: Update analytics-consent behavior so consent activation triggers immediate initial pageview tracking.
- `matomo-enhanced`: Extend pageview requirement from route-change-only behavior to include the first consented in-app view.

## Impact

- Affected code: Worker endpoint logic in `worker.ts`, Matomo init/consent flow in `src/lib/matomo.ts` and `src/routes/+layout.svelte`, and sidebar consumer behavior in `src/lib/components/LeftSidebar.svelte`.
- API/data shape: No breaking changes to `/api/wp-auth-status` response schema.
- Deployment/runtime: No adapter changes; remains static-compatible and Cloudflare Worker-compatible. No new third-party dependencies.
