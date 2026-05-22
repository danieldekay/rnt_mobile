# Security Hardening Results (Tasks 1.2-1.7)

## Summary
All 5 tasks completed successfully. Type check and build pass.

## Task 1.2: Refactor `/api/wp-auth-status` (Complete)
- **File**: `worker.ts` (lines 144-210 approx.)
- **Change**: Removed WordPress cookie forwarding. The handler now uses `HEAD` instead of `GET` to check WordPress availability without forwarding any client session cookies.
- **Impact**: The endpoint no longer exposes the client's WordPress login state. It returns only generic availability info (`available: boolean`, `loginUrl`, `adminUrl`).
- **Tests**: Updated `src/worker.auth-status.test.ts` to expect no cookie forwarding, HEAD method, and generic responses without `loggedIn` field.

## Task 1.4: Newsletter Nonce/Authenticity (Complete)
- **Files**: `worker.ts`, `src/lib/newsletter/sendy.ts`, `src/lib/newsletter/signup.ts`
- **Changes**:
  - Added `/api/newsletter/nonce` endpoint that generates a UUID nonce stored in Cloudflare cache with 5-minute TTL
  - `handleNewsletterSubscribe` and `handleNewsletterUnsubscribe` now require a valid nonce from the request body
  - Nonces are single-use (deleted from cache after validation)
  - Frontend `getNewsletterNonce()` function fetches a nonce before subscribe/unsubscribe
  - Updated `signup.ts` to fetch nonce before each operation
- **Impact**: CSRF attacks are now mitigated — an attacker cannot forge a subscribe/unsubscribe request without first obtaining a valid nonce from the worker.

## Task 1.5: CSRF-Safe Origin Validation (Complete)
- **File**: `worker.ts`
- **Change**: Updated origin validation in all three newsletter handlers (`subscribe`, `unsubscribe`, `status`) from `if (origin && origin !== requestUrl.origin)` to `if (!origin || origin !== requestUrl.origin)`.
- **Impact**: Requests without an `Origin` header are now rejected (403), closing the previous gap where requests without an Origin header bypassed CSRF protection.

## Task 1.6: Move Sendy List ID to Secret Binding (Complete)
- **Files**: `worker.ts` (Env interface), `wrangler.toml`
- **Changes**:
  - `SENDY_LIST_ID` moved from `Env` as optional `string` to required `Secret` type
  - `getSendyConfigInternal` updated to call `.toString()` on secrets before `.trim()`
  - `wrangler.toml`: Removed `SENDY_LIST_ID = "P04CWhVSOHvpkRVhqCvYKA"` from `[vars]`
  - Updated comments to document both `SENDY_API_KEY` and `SENDY_LIST_ID` as worker secrets
  - Defined `Secret` interface for TypeScript compatibility
- **Deployment**: Requires `wrangler secret put SENDY_LIST_ID` to be run on Cloudflare.

## Task 1.7: Remove Production console.log (Complete)
- **File**: `worker.ts` (proxyRssFeed error handler)
- **Change**: Removed `console.error("Links feed proxy error:", error)` from the RSS feed proxy error handler.
- **Impact**: No production console output in the worker. Errors are surfaced via JSON responses only.

## Files Changed
1. `worker.ts` — Core security changes (wp-auth-status, nonce, origin check, console.log removal, Secret type)
2. `wrangler.toml` — Removed plain-text SENDY_LIST_ID
3. `src/lib/newsletter/sendy.ts` — Added `getNewsletterNonce()`, nonce-aware subscribe/unsubscribe
4. `src/lib/newsletter/signup.ts` — Fetch nonce before subscribe/unsubscribe
5. `src/lib/newsletter/preferences.ts` — Minor: return spread of prefs (defensive copy)
6. `src/worker.auth-status.test.ts` — Updated tests for new wp-auth-status behavior

## Validation
- `npm run check`: ✅ 0 errors, 0 warnings
- `npm run build`: ✅ Cloudflare Pages compatible output

## Deployment Notes
Before deploying, run:
```bash
wrangler secret put SENDY_LIST_ID
```
Enter the list ID: `P04CWhVSOHvpkRVhqCvYKA`
