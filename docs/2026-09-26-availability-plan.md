# RNT availability implementation plan

## Goal

Keep the mobile calendar available when the RNT WordPress container is recreated, and prevent a release when the live event API is unavailable.

## Evidence

On 2026-09-26, the mobile app received HTTP 502 from `/api/events`. The WordPress `/wp-json/` endpoint also returned 502. RNT Nginx logged a FastCGI connection refusal to `172.18.0.2:9000`, while Docker DNS resolved `wordpress` to `172.18.0.3`. The WordPress container started after Nginx. Running the existing Ansible `nginx` tag reloaded Nginx and restored the API.

## Changes

1. In the Ansible-owned RNT Nginx config, use Docker's DNS resolver and a shared upstream group for both FastCGI paths. Make the Nginx Ansible tag report no changes on a repeat run.
2. Add a mobile release smoke command that checks the uncached WordPress event list before deployment. After deployment, check the mobile page, event list, and an event detail through the Worker.
3. Run Vitest, Svelte type checks, a strict production prerender, and the origin smoke command before `wrangler deploy`. Run origin and mobile smoke commands afterward so the workflow fails if the live app cannot load data. During prerender, use Node's fetch for the WordPress origin because SvelteKit's page fetch enforces cross-origin response headers that WordPress does not send. Retry transient transport and gateway failures up to three times, then fail the build. Fail when WordPress slug pagination returns a server error instead of silently omitting pages.

## Verification

Run smoke command tests against local good and failing HTTP fixtures, then run `npm run test:run`, `npm run check`, and `npm run build`. For Ansible, run `--check --diff --tags nginx`, apply the `nginx` tag, verify `nginx -t`, live WordPress and mobile API responses, and an idempotent repeat check. Do not recreate the production WordPress container solely for testing.

On 2026-09-26, the Nginx check and targeted apply passed; a repeat check reported `changed=0`. The live origin and mobile smoke commands passed, and a fresh browser session showed populated events. The strict mobile build completed with no prerender 404/500 errors and wrote 305 announcement pages. The full suite passed 186 tests; `npm run check` reported no errors and one existing Svelte warning.
