# RNT Mobile PWA - Deployment Guide

## Overview

This repository deploys to a **Cloudflare Worker Assets** service named `rnt`.
It does **not** deploy through Cloudflare Pages.

The recommended production route is:

1. push to `main`
2. let GitHub Actions build the app
3. let GitHub Actions run `wrangler deploy` using the repo's `wrangler.toml`

Live URLs:

- `https://mobile.rhein-neckar-tango.de`
- `https://rnt.daniel-1f6.workers.dev`

## Source Of Truth

Deployment configuration lives in:

- `.github/workflows/deploy.yml`
- `wrangler.toml`

Current Wrangler setup:

```toml
"$schema" = "./node_modules/wrangler/config-schema.json"

name = "rnt"
compatibility_date = "2024-01-01"
keep_vars = true

[assets]
directory = "./build"
not_found_handling = "single-page-application"

[vars]
PUBLIC_MATOMO_URL = "https://statistics.tangoparty.net"
PUBLIC_MATOMO_SITE_ID = "15"
```

`keep_vars = true` is intentional so dashboard-managed environment variables stay in place on deploy.

The `[vars]` block exposes Matomo configuration to the SvelteKit client bundle via
`$env/dynamic/public`. These values are **not secrets** — they are embedded in the public
client JavaScript and match the tracker snippet Matomo generates for copy-paste install.
Keeping them in `wrangler.toml` lets CI builds pick them up without extra GitHub Actions
variables, and mirrors `.env.example` for local development.

## Matomo Analytics

The app loads Matomo only after the user grants analytics consent. Configuration comes
from `PUBLIC_MATOMO_URL` and `PUBLIC_MATOMO_SITE_ID`. The `vite build` step reads these
from the environment (CI) or `.env` / `.env.local` (local dev). If either value is
missing, the Matomo module stays dormant and no requests are made — useful for forks
and PR previews that should not pollute production stats.

Tracked dimensions specific to PWA mode:

- `display_mode` — `standalone`, `minimal-ui`, `fullscreen`, or `browser`. Lets you split
  PWA-installed usage from browser usage in Matomo reports.
- `app_version` — bundled as a custom suffix on every event so release regressions are
  attributable to a specific deploy.

To reconfigure Matomo later:

1. Update `[vars]` in `wrangler.toml` (and `.env.example` if the value is new).
2. Commit and push. GitHub Actions will redeploy with the new values baked into the
   client bundle.

## Prerequisites

- Node version from `.nvmrc`
- Cloudflare account access
- GitHub repository access
- A `CLOUDFLARE_API_TOKEN` secret configured in GitHub Actions

## Local Build Validation

```bash
npm install
npm run check
npm run build
```

Build output is written to `build/`.

## GitHub Actions Route

The production workflow is `.github/workflows/deploy.yml`.

On every push to `main`, it does the following:

1. checks out the repository
2. installs the pinned Node version from `.nvmrc`
3. runs `npm ci`
4. runs `npm run build`
5. runs:

```bash
npx wrangler deploy --message "GitHub Actions deploy ${GITHUB_SHA}"
```

Because the workflow deploys from the repository root, it uses the checked-in `wrangler.toml` directly.

### Required GitHub Secret

Add this repository secret:

- `CLOUDFLARE_API_TOKEN`

The token must be able to deploy Workers. In practice, the token used here also has broader account permissions, but the critical capability for this workflow is Workers write access.

## Manual Emergency Deploy

If GitHub Actions is unavailable, use the same path locally that the workflow now uses:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use

npm run build
npx wrangler deploy --message "Manual deploy"
```

## Validation After Deploy

Minimum smoke test:

1. open `https://mobile.rhein-neckar-tango.de`
2. confirm the home page renders without runtime errors
3. confirm `/calendar` loads
4. confirm one event detail page loads
5. confirm legal links work
6. confirm the footer shows the expected app version

## Troubleshooting

### If `wrangler deploy` warns about Pages

That means the local configuration is stale or the command is being run against the wrong config. The repository should use Worker Assets config under `[assets]`, not `pages_build_output_dir`.

### If subroutes return the homepage incorrectly or 404

Check that `wrangler.toml` still contains:

```toml
[assets]
not_found_handling = "single-page-application"
```

### If dashboard variables disappear after deploy

Check that `keep_vars = true` is still present in `wrangler.toml`.

### If CSP errors show up in production

Check `static/_headers`. That file is the intended CSP source for the deployed app.

## Notes

- The app uses the SvelteKit static adapter, but hosting is through Cloudflare Worker Assets rather than Pages.
- Custom domain routing is already attached to the `rnt` Worker in Cloudflare.
- The current production flow has been validated locally by running `wrangler deploy` from the repository root with the checked-in config.
