---
type: Deployment
title: Deployment Pipeline
description: CI/CD workflow, Cloudflare Worker deployment, and environment configuration for RNT Mobile.
tags: [deployment, ci-cd, cloudflare, wrangler, github-actions]
sources:
  - id: deploy
    resource: /sources/DEPLOY.md
    title: Deployment Guide
  - id: readme
    resource: /sources/README.md
    title: RNT Mobile README
  - id: agents
    resource: /sources/AGENTS.md
    title: AGENTS.md
generated: { by: agent/copilot, at: 2026-07-25T21:10:00Z }
status: stable
---

# Deployment Pipeline

RNT Mobile deploys automatically to Cloudflare Worker Assets via GitHub Actions.

## Deployment Target

**Cloudflare Worker Assets** service named `rnt`. Not Cloudflare Pages.

Live URLs:
- `https://mobile.rhein-neckar-tango.de`
- `https://rnt.daniel-1f6.workers.dev`

## CI/CD Workflow

### Trigger

Push to `main` branch triggers `.github/workflows/deploy.yml`.

### Workflow Steps

1. **Checkout** — clone repo
2. **Setup Node** — use version from `.nvmrc`
3. **Install** — `npm install`
4. **Typecheck** — `npm run check` (svelte-kit sync + svelte-check)
5. **Build** — `npm run build` → output to `build/`
6. **Deploy** — `wrangler deploy` using `wrangler.toml`

### Manual Deploy

```bash
npm run build
npx wrangler deploy --message "Manual deploy"
```

## Wrangler Configuration

`wrangler.toml`:

```toml
name = "rnt"
main = "./worker.ts"
compatibility_date = "2024-01-01"
keep_vars = true

[assets]
directory = "./build"
not_found_handling = "single-page-application"

[vars]
PUBLIC_MATOMO_URL = "https://statistics.tangoparty.net"
PUBLIC_MATOMO_SITE_ID = "15"
SENDY_BASE_URL = "https://newsletter.rheinneckartango.de"
SENDY_LIST_ID = "P04CWhVSOHvpkRVhqCvYKA"
```

### Key Settings

- `keep_vars: true` — preserves dashboard-managed environment variables on deploy
- `not_found_handling: "single-page-application"` — SPA routing for client-side routes
- `[vars]` — embedded in client bundle via `$env/dynamic/public`

## Environment Variables

### Client-Exposed (via `[vars]`)

| Variable | Purpose |
|----------|---------|
| `PUBLIC_MATOMO_URL` | Matomo analytics endpoint |
| `PUBLIC_MATOMO_SITE_ID` | Matomo site ID |
| `SENDY_BASE_URL` | Sendy newsletter API base |
| `SENDY_LIST_ID` | Sendy newsletter list ID |

### Worker-Side Only

`SENDY_BASE_URL` and `SENDY_LIST_ID` are used by the Worker for the newsletter form proxy. They are not read by the browser bundle.

### CI Environment

Build reads `[vars]` from `wrangler.toml` (or `.env` / `.env.local` for local dev). If Matomo values are missing, the Matomo module stays dormant — useful for forks and PR previews.

## Build Output

Static files in `build/`:
- `index.html` (prerendered)
- `_app/` (SvelteKit client assets)
- `manifest.json` (PWA manifest)
- `service-worker.js` (PWA service worker)
- Static assets (icons, fonts)

## Version Tracking

`vite.config.ts` injects `__APP_VERSION__` from `package.json` and a commit hash (from `GITHUB_SHA`, `CF_PAGES_COMMIT_SHA`, or `git rev-parse`).

## Cross-References

- [Architecture](/concepts/architecture.md) — system-level structural decisions
- [PWA System](/concepts/pwa-system.md) — PWA manifest and service worker
- [Analytics](/concepts/analytics.md) — Matomo tracking configuration
