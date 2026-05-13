## Why

The app currently renders identically on mobile and desktop: a single narrow `max-w-xl` column centred on the page. Desktop users see a sub-optimal narrow strip with large empty side margins. Adding a responsive shell with persistent left-sidebar navigation and an optional right-sidebar panel will unlock the full-width desktop experience that all subsequent desktop screen changes depend on, without touching any mobile behaviour.

## What Changes

- Add CSS custom properties and Tailwind utilities for the desktop shell grid (sidebar widths, gutter spacing) to `src/app.css`.
- Introduce a `DesktopLayout.svelte` wrapper component that:
  - Below `1024px`: renders `children` directly, no structural change.
  - At `1024px+`: renders a three-column CSS grid — 240 px fixed `LeftSidebar` | flexible `main` | optional `RightSidebar` slot.
- Introduce `LeftSidebar.svelte` — persistent vertical navigation matching the Stitch design (logo, primary nav links, footer links). Hidden on mobile.
- Introduce `RightSidebar.svelte` — optional contextual panel slot. Collapses/absent on narrow viewport. Hidden on mobile.
- Update `src/routes/+layout.svelte` to wrap content in `DesktopLayout`, threading the `LeftSidebar` and exposing the `RightSidebar` slot for route-level opt-in.
- No changes to existing mobile markup, routing, prerendering, or API calls.

## Capabilities

### New Capabilities

- `desktop-shell`: Responsive three-column layout shell with 240 px fixed left navigation sidebar and optional right contextual sidebar; activates at ≥1024 px; below that the layout is unchanged from the current mobile-first design.

### Modified Capabilities

- `home-event-browsing`: Layout-hosting concern only — no requirement change, but the main column max-width constraint changes on desktop.
- `calendar-browsing`: Same layout-hosting concern.

## Impact

- **Files changed**: `src/app.css`, `src/routes/+layout.svelte`
- **New files**: `src/lib/components/DesktopLayout.svelte`, `src/lib/components/LeftSidebar.svelte`, `src/lib/components/RightSidebar.svelte`
- **No new API endpoints** — pure layout infrastructure
- **Prerender / deployment**: No route additions; `npm run build` must still succeed for static export
- **Stitch reference**: https://stitch.withgoogle.com/projects/6101620989348291389
