## 1. Theme Foundation

- [x] 1.1 Replace the Tailwind color, font, radius, and shadow extensions in `tailwind.config.js` with the semantic token mapping from `DESIGN.md`
- [x] 1.2 Replace the root CSS variables and global surface styles in `src/app.css` with the new paper/card/token system and remove decorative gradient or glass defaults
- [x] 1.3 Introduce the approved body and display font loading strategy and app-wide typography assignments in `package.json` and `src/app.css`

## 2. Shared Shell And Primitives

- [x] 2.1 Restyle the app shell in `src/routes/+layout.svelte` to use the new header, footer, navigation, and install-banner treatment
- [x] 2.2 Rework the shared chip and segmented filter styling in `src/lib/components/FilterChip.svelte` and `src/lib/components/DateFilter.svelte` to meet the new mobile sizing and active-state requirements
- [x] 2.3 Rework the selected-date summary and calendar grid styling in `src/lib/components/DateSelector.svelte` and `src/lib/components/Calendar.svelte` to match the new high-contrast utility system
- [x] 2.4 Restyle `src/lib/components/EventCard.svelte` so logistics dominate optional imagery and the card uses the new semantic primitives only

## 3. Route-Level Redesign

- [x] 3.1 Update the home event browsing screen in `src/routes/+page.svelte` to use the redesigned search, filter, toggle, empty, error, and map/list presentation
- [x] 3.2 Update the calendar browsing screen in `src/routes/calendar/+page.svelte` to align page-level hierarchy and selected-date presentation with the new design system
- [x] 3.3 Update the event detail screen in `src/routes/event/[id]/+page.svelte` to deliver the logistics-first section order, high-contrast reading surfaces, and touch-friendly outbound actions

## 4. Validation

- [x] 4.1 Run `npm run check` and fix any regressions introduced by the redesign changes
- [x] 4.2 Run `npm run build` and verify the static build still succeeds with the redesigned routes and shared components