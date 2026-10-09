# Proposal: 0.5.1 Reliability Hardening

## Why

RNT Mobile has accumulated several runtime and repository-consistency risks around newsletter requests, Service Worker caching, deployment validation, event pagination, and stale architecture documentation. Some previously documented remediations are incomplete or contradicted by current code.

## User-visible outcome

- Newsletter subscribe/unsubscribe requests no longer fail because the request body is read twice.
- Offline navigation reliably falls back to the dedicated offline page.
- Previously loaded event data can be recovered from a compact 30-day offline snapshot.
- Sensitive and mutating API calls are never cached by the Service Worker.
- Entity pages stay within bounded event windows.
- Production deployment is blocked when tests, type checks, or builds fail.

## Affected areas

- Cloudflare Worker routing and newsletter handlers
- Service Worker and event store offline recovery
- Event pagination and entity routes
- GitHub Actions CI/deployment
- OpenSpec, inventory, and release documentation

## Architecture decision

Keep the current static SvelteKit PWA + Cloudflare Worker Assets architecture for 0.5.1. Authentication remains a future architectural decision; no server-only SvelteKit assumptions are introduced into the static app.
