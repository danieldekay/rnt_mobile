## Context

The current app already covers the core RNT product flows, but its styling is anchored in bright sky gradients, semi-glass cards, rounded pills, and Inter-based typography. The supplied design system in `DESIGN.md` replaces that direction with a Bauhaus civic utility approach optimized for older, mobile-first, repeat visitors who rely on fast, high-trust event planning.

This change is cross-cutting because it affects global tokens, app-wide typography, shared primitives, and the three primary user-facing flows already backfilled into `openspec/specs/`. The current code structure is favorable for this work: styling enters primarily through `src/app.css`, `tailwind.config.js`, `src/routes/+layout.svelte`, and shared components such as `EventCard.svelte`, `FilterChip.svelte`, `DateFilter.svelte`, `DateSelector.svelte`, and `Calendar.svelte`. Data fetching and state management in `src/lib/api/tribe.ts` and `src/lib/stores/events.svelte.ts` should remain unchanged.

Constraints:
- preserve adapter-static and Cloudflare Pages compatibility
- keep existing route structure and store behavior intact
- maintain mobile-first interaction patterns while increasing readability and tap-target reliability

Stakeholders:
- returning community members using the app as a trusted calendar utility
- older mobile users who need stronger readability and lower interaction friction

## Goals / Non-Goals

**Goals:**
- Replace route-level decorative styling with the semantic token system defined in `DESIGN.md`
- Introduce the approved typography pair and apply it consistently across headings, body copy, metadata, and controls
- Restyle the shared UI primitives first so the app shell, home page, calendar page, and event detail page inherit a coherent visual system
- Preserve current event loading, filtering, search, calendar selection, detail loading, and map behavior while improving readability, hierarchy, and accessibility

**Non-Goals:**
- No changes to the WordPress events API, route model, or event store logic
- No re-architecture of the app into a new component system beyond what is required to apply the design tokens and shared primitives
- No new product features beyond design-system-driven UX improvements already called for by `DESIGN.md`
- No expansion into editorial, newsletter, or donation flows that are not yet implemented in the app

## Decisions

### Decision: Migrate to semantic tokens at the app root before touching individual screens
- Choice: replace the current hard-coded palette in `src/app.css` and `tailwind.config.js` with the semantic token library from `DESIGN.md`, then restyle components against semantic utilities.
- Rationale: this makes the redesign coherent and prevents screen-by-screen drift back to pigment-based classes.
- Alternative considered: restyle each component directly with hard-coded colors while leaving the current Tailwind palette intact.
- Why not: it would preserve the current visual inconsistency and make future maintenance harder.

### Decision: Change fonts and control metrics as part of the same foundation pass
- Choice: adopt `Atkinson Hyperlegible Next` for body/UI text and `IBM Plex Sans Condensed` for display text, and normalize shared minimum control heights around the design system's target sizes.
- Rationale: the audience and design brief make readability and touch ergonomics first-order requirements, so typography and sizing cannot be deferred to a polish pass.
- Alternative considered: keep Inter initially and only swap colors, borders, and shadows.
- Why not: it would leave one of the main accessibility and brand goals unmet.

### Decision: Rebuild shared primitives before route-specific refinements
- Choice: update the shared button, card, chip, input, date selector, and calendar primitives first, then restyle the route templates that compose them.
- Rationale: most route screens are assembled from a small number of shared components, so changing primitives first reduces duplication and keeps the redesign consistent.
- Alternative considered: restyle the home page, calendar page, and detail page independently.
- Why not: it would duplicate visual logic and risk divergence between screens.

### Decision: Preserve data and behavior modules and constrain the redesign to presentation layers
- Choice: keep `src/lib/api/tribe.ts` and `src/lib/stores/events.svelte.ts` behaviorally stable and focus the change on CSS tokens, Tailwind theme mapping, shared components, and route markup where hierarchy needs adjustment.
- Rationale: the requested change is a visual and accessibility redesign, not a behavior rewrite, and the current data flow already supports the required screens.
- Alternative considered: use the redesign as an opportunity to refactor store structure or API shaping.
- Why not: it would expand scope without supporting the core user-visible goal.

### Decision: Keep imagery optional and subordinate to logistics in event surfaces
- Choice: preserve the existing ability to show event images, but restructure event cards and detail surfaces so time, place, format, and price remain dominant on mobile.
- Rationale: the design brief explicitly prioritizes utility and mature, in-a-hurry users over decorative browsing.
- Alternative considered: keep large visual image headers and let logistics remain secondary.
- Why not: it conflicts with the stated product posture and the migration guidance in `DESIGN.md`.

## Risks / Trade-offs

- [Font delivery choice adds implementation friction] → Mitigation: prefer locally bundled or package-based font loading and validate that the app still builds statically.
- [Semantic token migration may leave mixed old and new classes during transition] → Mitigation: update `src/app.css` and `tailwind.config.js` first, then move shared components in one pass before route cleanup.
- [Category accents can weaken contrast if mapped too literally from the old palette] → Mitigation: constrain category accents to limited markers and keep primary text and surfaces on the documented neutral system.
- [Existing install banner and map surfaces may visually clash after the redesign] → Mitigation: include `src/routes/+layout.svelte` and the map containers in the same primitive restyling pass.
- [Design breadth can sprawl across too many files at once] → Mitigation: implement in the migration order from `DESIGN.md` and keep behavior logic out of scope unless needed for accessibility.

## Migration Plan

1. Replace root CSS variables and Tailwind theme extensions with the semantic tokens from `DESIGN.md`.
2. Introduce the approved fonts and update shared app-level type styles in `src/app.css`.
3. Rebuild shared primitives and states used by cards, buttons, chips, segmented controls, inputs, and focus rings.
4. Restyle `src/routes/+layout.svelte`, `src/routes/+page.svelte`, `src/routes/calendar/+page.svelte`, and `src/routes/event/[id]/+page.svelte` using the new primitives and token utilities.
5. Validate with `npm run check`, then run `npm run build` because layout, routing presentation, and static rendering surfaces are affected.
6. Roll back by reverting the styling and route/component changes together if the redesigned theme causes unacceptable readability or layout regressions.

## Open Questions

- Which local font-loading approach should be used for the approved typefaces in this SvelteKit app?
- Should the current install banner remain part of the redesign scope now, or only be visually normalized to the new token system?
- How much category accent color should remain in cards and calendar markers under the stricter Bauhaus utility palette?