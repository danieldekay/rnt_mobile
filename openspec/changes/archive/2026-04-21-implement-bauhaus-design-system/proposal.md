## Why

The current app uses bright gradients, glassy cards, small chip patterns, and Inter-based styling that conflict with the supplied RNT design direction and underserve the product's mobile-first, older, utility-oriented audience. This redesign is needed now to align the app with the documented Bauhaus civic utility brief, improve readability and tap ergonomics, and establish a reusable visual foundation before further feature work continues.

## What Changes

- Introduce a semantic visual foundation for the app with the documented palette, typography, radius, shadow, and focus tokens.
- Replace the current bright gradient and glass-heavy styling with high-contrast paper, card, line, and action surfaces.
- Rebuild shared UI primitives and shared route-level styling so buttons, cards, filters, inputs, and navigation follow the new age-friendly system.
- Restyle the home event list, calendar page, and event detail page so the existing functionality remains intact while presentation, hierarchy, and accessibility improve.
- Keep the current data loading, filtering, routing, and Cloudflare Pages static deployment model unchanged.

## Capabilities

### New Capabilities
- `visual-foundation`: Defines the app-wide semantic tokens, typography system, focus treatment, and shared component primitives used across routes.

### Modified Capabilities
- `home-event-browsing`: Changes the visual presentation of filters, cards, search, map toggle, and empty or error states to match the new design system.
- `calendar-browsing`: Changes the visual presentation of the month grid, selected day summary, and day-level event list to match the new design system.
- `event-detail`: Changes the visual presentation of the detail layout so logistics, venue, pricing, description, and outbound actions follow the new hierarchy and accessibility rules.

## Impact

- Affected code includes `tailwind.config.js`, `src/app.css`, `src/routes/+layout.svelte`, `src/routes/+page.svelte`, `src/routes/calendar/+page.svelte`, `src/routes/event/[id]/+page.svelte`, and shared components in `src/lib/components/`.
- No API or data-shape changes are expected; the WordPress events feed remains the same.
- No deployment-model changes are expected; the app remains adapter-static based and deployable to Cloudflare Pages.