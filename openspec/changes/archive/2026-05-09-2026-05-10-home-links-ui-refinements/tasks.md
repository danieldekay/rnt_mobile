# Tasks: UI Refinements (Home & Links)

## Phase 1: Home Page - DateFilter Redesign

- [x] 1.1 Update `src/lib/components/DateFilter.svelte` styling
    - Change the container background and padding to match the filter chip patterns used elsewhere.
    - Adjust the button heights and padding to ensure they match the `Bilder` and `Karte` buttons (currently `min-h-12`).
    - Use the standard `rounded-control` and `shadow-card` tokens for active states.
- [x] 1.2 Align `DateFilter` with `Bilder/Karte` buttons in `src/routes/+page.svelte`
    - Ensure the layout wrapper for these three elements provides consistent spacing and alignment.
- [x] 1.3 Verify accessibility
    - Ensure `aria-pressed` states and focus rings remain functional with the new styling.

## Phase 2: Links Page - Table Optimization

- [x] 2.1 Adjust column widths in `src/routes/links/+page.svelte`
    - Narrow **Typ** (Category) column to ~12%.
    - Narrow **Aktion** column to ~10%.
    - Expand **Beschreibung** (Description) column to ~42% to reduce row height.
- [x] 2.2 Fix Umlaut in buttons
    - Change "Oeffnen" to "Öffnen" in both the desktop table and mobile list view.
- [x] 2.3 Deactivate "Link vorschlagen"
    - Comment out or remove the "Link vorschlagen" button in the filter toolbar.
- [x] 2.4 Verify layout on desktop
    - Ensure the table uses the full available width of the `DesktopLayout` content area.

## Phase 3: Validation

- [x] 3.1 Run `npm run check` to ensure no TypeScript or Svelte errors were introduced.
- [x] 3.2 Visual check of the Home page filters on mobile and desktop.
- [x] 3.3 Visual check of the Links table density on desktop.