# Matomo Analytics in PWA Mode

This document explains how analytics works in the RNT Mobile PWA, what is tracked,
and what one-time setup you (the site owner) need to do on the Matomo instance at
`statistics.tangoparty.net`.

## TL;DR — What You Need To Do

1. **On your Matomo admin** (`https://statistics.tangoparty.net`):
   - Log in as an admin of site `15` ("RNT Mobile" or similar).
   - Go to **Personal → Custom Dimensions** (or **Administration → Websites →
     Custom Dimensions** depending on your Matomo version).
   - Create a **visit-scoped** custom dimension with:
     - **ID**: `1`
     - **Name**: `display_mode`
     - **Active**: yes
   - Save.
2. **That's it.** The app is already wired up; the next deploy after this change
   will start populating the dimension.

If you skip step 1, the app keeps working and still sends the value — it just
shows up as a "custom variable" in the older Matomo UI rather than a first-class
dimension in the new reports.

## What Gets Tracked

Analytics is **off by default** and only turns on after the user clicks "Alle
akzeptieren" or enables "Analytik mit Matomo" in the consent dialog.

Once consent is granted, the app sends:

| Event type       | Trigger                                        | Payload highlights                                   |
|------------------|-------------------------------------------------|------------------------------------------------------|
| `trackPageView`  | Every SvelteKit client-side navigation         | URL, document title, display mode                    |
| `trackEvent`     | Every navigation (companion to page view)      | `app / route_view / <feature>@<version>:<display>`   |
| `trackEvent`     | User toggles map / enables consent / etc.      | `<feature> / <action> / <detail>@<version>:<display>`|
| Heartbeat ping   | Every 30s while the window is focused          | Keeps time-on-page accurate in long standalone sessions |

Every outgoing request carries:

- **Custom Dimension 1** = `display_mode` → one of
  `standalone`, `minimal-ui`, `fullscreen`, `browser`.
- **Custom Variable 1** = same (fallback for Matomo instances without the
  custom dimension configured).
- App version suffix on every event `action@version:display_mode` so regressions
  are attributable to a specific deploy.

Cookies are **disabled** (`disableCookies`) — Matomo tracks anonymously with
short-lived visitor hashes only. This is why no cookie banner entry is needed
beyond the existing analytics consent toggle.

## How The PWA Mode Detection Works

The app decides which `display_mode` to report by checking, in order:

1. `navigator.standalone === true` — iOS Safari's legacy "Added to Home Screen"
   signal.
2. `window.matchMedia('(display-mode: standalone)').matches` — installed PWA
   on Android / Chrome / Edge / modern iOS.
3. `...('(display-mode: minimal-ui)')` — minimal chrome install.
4. `...('(display-mode: fullscreen)')` — fullscreen install.
5. Fallback: `browser` — regular tab in a browser.

The detection runs on first track, and a `matchMedia` listener re-checks whenever
the display mode changes at runtime (e.g. user installs mid-session, or launches
from home screen into a different mode).

## Splitting PWA Usage From Browser Usage In Matomo

Once the custom dimension is set up (see TL;DR above), you can filter any report
by `display_mode`:

- **Visitors → Overview**: segment by `display_mode == standalone` to see only
  installed-PWA users.
- **Behaviour → Pages**: compare pageview counts between `standalone` and
  `browser` segments to see which screens PWA users hit vs casual browser
  visitors.
- **Goals / Events**: the display mode is also embedded in every event's Action
  string (suffix `:standalone` / `:browser` / etc.), so even without segmenting
  you can eyeball the difference.

## Offline And Backgrounded App Behaviour

Two PWA-specific gotchas are handled:

1. **`alwaysUseSendBeacon`** is enabled. When the user swipes the installed PWA
   away or the OS kills the window, the final tracked event still flushes
   through `navigator.sendBeacon`. Without this, the last pageview of a visit
   is usually lost because the browser cancels in-flight XHRs on unload.
2. **Offline queue in `localStorage`**. If the user is offline (network down or
   airplane mode), tracked events are appended to `matomo-pending-events` in
   `localStorage`. When the `online` event fires, the queue is drained into
   Matomo's tracker and flushed with `getAsyncTracker().sendRequests()`. The
   queue caps at 100 events to avoid storage bloat.

Note: we do **not** use a service worker to cache `matomo.js`. If the user opens
the installed PWA while completely offline, the tracker script simply doesn't
load and analytics is skipped for that session — but the app's own UI keeps
working because it's served from the Cloudflare Worker Assets cache.

## Configuration

Matomo credentials are plain build-time public values (they're embedded in the
client JS anyway — they are not secrets).

| Location            | Purpose                                               |
|---------------------|-------------------------------------------------------|
| `.env.example`      | Template for local dev; copy to `.env` if needed.     |
| `wrangler.toml` `[vars]` | Production values baked into CI/CD deploys.      |
| `src/lib/matomo.ts` | Reads via `$env/dynamic/public`.                      |

Current production values:

```toml
[vars]
PUBLIC_MATOMO_URL = "https://statistics.tangoparty.net"
PUBLIC_MATOMO_SITE_ID = "15"
```

### Changing Matomo URL Or Site ID

1. Edit `wrangler.toml` `[vars]`.
2. Edit `.env.example` to match (so local dev stays in sync).
3. Commit and push. The deploy workflow rebuilds and the new values ship
   on the next push to `main`.

### Disabling Matomo Entirely (e.g. for a PR preview)

Remove or leave blank `PUBLIC_MATOMO_URL` or `PUBLIC_MATOMO_SITE_ID`. The module
detects missing config and becomes a no-op — zero requests are made. This is
why `.env` is gitignored: forks and preview builds can skip Matomo without code
changes.

## Verifying It Works

### In local dev

1. `npm run dev`
2. Open the app in a browser.
3. Accept analytics consent in the banner.
4. Open the browser DevTools **Network** tab and filter on `matomo`.
5. You should see requests to `https://statistics.tangoparty.net/matomo.js`
   (the tracker) and `https://statistics.tangoparty.net/matomo.php?...`
   (the beacon with your tracking data).
6. In the `matomo.php` query string, look for `dimension1=browser` — that's the
   display mode dimension firing.

### After deploy to production

1. Open `https://mobile.rhein-neckar-tango.de` in a browser tab.
2. Accept analytics consent.
3. Install the PWA ("App installieren" banner).
4. Launch the installed app from the home screen.
5. In Matomo's real-time visitor view, you should see two distinct visits:
   one with `display_mode = browser`, one with `display_mode = standalone`.

### Verifying offline queue

1. Accept analytics consent.
2. In DevTools → Network, switch to "Offline".
3. Navigate inside the app (click a few events).
4. Confirm `localStorage.matomo-pending-events` grows.
5. Switch back to "Online".
6. Watch the Network tab — the queued events flush in a burst.
7. Confirm `localStorage.matomo-pending-events` is cleared.

## Troubleshooting

### "No data in Matomo"

1. Check `wrangler.toml` `[vars]` is present and values match the Matomo
   installation.
2. Check the browser Network tab for `matomo.php` requests. If none:
   - Has the user accepted analytics consent? (clear `localStorage.rnt-consent`
     to re-trigger the banner).
   - Is an ad blocker / tracking protection blocking the request? Matomo
     self-hosted on your own domain is usually spared, but `statistics.*`
     subdomains sometimes get caught.
3. Confirm site ID `15` still exists in Matomo and is set to accept hits from
   `mobile.rhein-neckar-tango.de`.

### "display_mode dimension shows nothing in Matomo"

- You likely haven't created Custom Dimension 1 yet (see TL;DR).
- Or you created it but not in the "visit" scope — scope matters for Matomo.
- The data is still there as Custom Variable 1 — check
  **Visitors → Custom Variables** for a workaround view.

### "Heartbeat requests are noisy in logs"

Heartbeat pings fire every 30s while the window is focused. If this is too
chatty for your Matomo log retention:

- Edit `src/lib/matomo.ts`, line with `enableHeartBeatTimer(30)`.
- Increase the interval (seconds), e.g. `60` or `120`.
- Or remove the line entirely if you don't care about accurate time-on-page.

## Files Touched By This Feature

- `src/lib/matomo.ts` — all tracking logic.
- `src/routes/+layout.svelte` — wires consent state and route changes into
  the tracker.
- `wrangler.toml` — public Matomo config for production builds.
- `.env.example` — template for local dev.
- `DEPLOY.md` — deployment-side documentation.
- `openspec/specs/privacy-consent/spec.md` — the consent spec analytics depends on.
