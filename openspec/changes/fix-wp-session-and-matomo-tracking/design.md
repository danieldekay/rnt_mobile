# Design: Fix WP Session and Matomo Tracking

## Context

The app exposes WordPress auth status through `/api/wp-auth-status` in `worker.ts`, and the desktop shell renders that status in the sidebar. Current production logic checks `wp-json/wp/v2/users/me` using forwarded cookies, which can report unauthenticated without REST nonce context even when a valid wp-admin session exists.

Matomo is consent-gated in the app shell and currently tracks SPA navigation, but first-load analytics after consent can be missed when no post-consent route change occurs. This creates a user-visible "Matomo does not work" perception although infrastructure and CSP are healthy.

Constraints:

- Keep response contract of `/api/wp-auth-status` stable.
- Preserve static adapter and Cloudflare Worker deployment compatibility.
- Do not introduce new external dependencies.

## Goals / Non-Goals

**Goals:**

- Make WordPress login detection reliable for sidebar status and WP admin shortcuts.
- Keep existing status API payload shape and semantics for UI compatibility.
- Ensure Matomo emits an initial pageview immediately after analytics consent is active.
- Minimize behavior changes outside auth-status and consent-tracking flow.

**Non-Goals:**

- Reworking WordPress authentication architecture or introducing OAuth/JWT.
- Changing consent UX copy, layout, or category model.
- Refactoring Matomo event taxonomy beyond initial-pageview correctness.
- Adding server-side session storage or persistent backend state.

## Decisions

### Decision 1: Use wp-admin profile redirect behavior as primary login detector

- Choice: Replace Worker auth check based on `/wp-json/wp/v2/users/me` with a request to `/wp-admin/profile.php` using forwarded cookie header and `redirect: manual`.
- Rationale: `profile.php` behavior maps directly to "is this browser session authenticated for wp-admin" without requiring REST nonce material.
- Alternative considered: Keep `/users/me` and add nonce handling.
  - Rejected because nonce is not available in this cross-origin proxy path and would make status brittle.

### Decision 2: Keep auth-status API contract unchanged

- Choice: Preserve `{ ok, loggedIn, available, message, loginUrl, adminUrl }` shape and existing endpoint path.
- Rationale: Sidebar UI and existing consumers keep working with no integration churn.
- Alternative considered: Introduce richer status enum.
  - Rejected to avoid unnecessary surface-area change for a bugfix scope.

### Decision 3: Trigger immediate Matomo pageview on consent-enabled initial render

- Choice: On analytics-enabled state, call consent sync with current URL/title once per active page lifecycle so first consented view is tracked without waiting for `afterNavigate`.
- Rationale: Fixes false-negative analytics perception for users who open and stay on one page.
- Alternative considered: Keep `afterNavigate` only and rely on user navigation.
  - Rejected because it loses first-view data and appears broken.

### Decision 4: Preserve existing consent gate and queue behavior

- Choice: Keep current consent conditions and Matomo queue/offline logic unchanged except for initial-pageview trigger.
- Rationale: Limits regression risk and keeps GDPR behavior stable.
- Alternative considered: Rewrite Matomo bootstrap flow.
  - Rejected due to higher risk and no additional value for this change.

## Risks / Trade-offs

- [WordPress admin endpoint behavior changes upstream] -> Mitigation: treat non-200 and login redirects as logged-out, return stable fallback messaging, and keep timeout handling.
- [Initial pageview duplicates] -> Mitigation: rely on existing `lastTrackedUrl` de-duplication in `matomo.ts` and ensure trigger occurs through same tracking path.
- [Edge cache or network latency masks auth state] -> Mitigation: enforce `no-store` on status response and retain explicit unavailable error state.
- [Cookie policies vary by browser] -> Mitigation: maintain graceful logged-out fallback with actionable login URL.

## Migration Plan

1. Update Worker auth-status implementation to profile-redirect detection while preserving payload schema.
2. Update consent-tracking flow to send initial pageview on consent-enabled first render.
3. Validate locally and on deployed worker:
   - no-cookie: `loggedIn=false` with login message,
   - authenticated cookie: `loggedIn=true`,
   - login redirect path: `loggedIn=false`,
   - Matomo request emitted on first consented view.
4. Deploy via existing workflow with no infrastructure changes.

Rollback:

- Revert `worker.ts` and Matomo consent trigger changes; endpoint and UI contract remain stable.

## Open Questions

- Should the auth-status check retain a secondary REST probe for diagnostics, or stay single-strategy for simplicity?
- Do we want to surface a UI hint when tracking is blocked by browser privacy tools despite consent?
