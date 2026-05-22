# Rollout Notes

**Change:** `address-diagnosis-findings`
**Date:** 2026-05-15
**Schema:** spec-driven (spec-driven)

---

## New Secrets Required

### `SENDY_LIST_ID`

- **Purpose:** Sendy newsletter list identifier, moved from plain `wrangler.toml` to worker secret binding (Task 1.6).
- **Deployment:** Run `wrangler secret put SENDY_LIST_ID` on your Cloudflare account before deploying.
- **Value:** The Sendy list ID for the RNT newsletter (obtain from your Sendy admin panel).
- **Verify:** Check worker environment via `wrangler secret list` after setting.

## Worker Configuration Changes

- **CSP headers** now enforced via `_headers` file (handled by adapter-static). See `build/_headers` for full CSP policy.
- **Auth-status endpoint** (`/api/wp-auth-status`) returns non-session-sensitive generic status data — no longer reflects WordPress cookie state (Task 1.2).
- **Newsletter endpoints** (`/api/newsletter/subscribe`, `/api/newsletter/unsubscribe`) now require explicit authenticity proof via CSRF-safe token (Tasks 1.4, 1.5).
- **Rate limiting** added to worker API endpoints with safe defaults (Task 4.4).

## Service Worker

- **App-shell caching strategy** implemented (Task 5.6):
  - Static assets (JS, CSS, fonts) cached at install time.
  - API calls (`/api/*`) cached with stale-while-revalidate.
  - Navigation requests (page loads) fall back to offline page if API fails.
- **Activation:** Service worker activates on next page load after deployment. Existing users may need to reload (Ctrl/Cmd+Shift+R) to pick up changes.
- **Cache version:** `rnt-cache-<timestamp>` — old caches are purged on activate.

## Offline Page

- `/offline` route serves a dedicated offline fallback page (Task 5.5).
- Service worker intercepts failed navigation requests and returns offline page.
- Page includes minimal RNT branding and meta tags matching the app shell.

## Breaking Changes

1. **`SENDY_LIST_ID` secret required:** If not set via `wrangler secret put SENDY_LIST_ID`, newsletter subscription/unsubscription endpoints will return errors.
2. **Auth-status API response changed:** The `/api/wp-auth-status` endpoint no longer exposes WordPress session state. Clients should not rely on cookie-state reflection from this endpoint.
3. **Newsletter CSRF protection:** Existing newsletter subscription tokens may need re-issuance since subscribe/unsubscribe now require explicit authenticity proof.

## Deployment Checklist

- [ ] Run `wrangler secret put SENDY_LIST_ID` with your Sendy list ID.
- [ ] Verify `wrangler secret list` includes `SENDY_LIST_ID`.
- [ ] Deploy to Cloudflare Pages as usual (`npm run build` output goes to `build/`).
- [ ] Confirm `_headers` file is included in deployment (adapter-static handles this).
- [ ] Test newsletter subscription flow after deployment.
- [ ] Verify offline page is accessible at `/offline` after deployment.
- [ ] Have users do a hard refresh (Ctrl/Cmd+Shift+R) to activate the new service worker.

## Monitoring Notes

- Watch for newsletter subscription errors indicating missing `SENDY_LIST_ID`.
- The auth-status endpoint now returns generic data — any client relying on WordPress session reflection from this endpoint will need updating.
- Service worker cache version includes timestamp; old cache entries are automatically purged on activation.
