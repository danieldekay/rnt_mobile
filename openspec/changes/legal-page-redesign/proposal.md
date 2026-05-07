# Proposal: Legal Page Redesign

## Why

rnt_mobile serves legal pages (Impressum, Datenschutz, Cookie-Richtlinie) by fetching rendered HTML from the WordPress REST API and embedding it directly in each route. This approach works but has gaps:

1. **No print support** — legal pages cannot be printed or saved as PDF with clean formatting. The content spills into print with full UI chrome (navbars, TOC) and ugly backgrounds.
2. **No table of contents** — long legal pages (especially Datenschutz) have no way to navigate between sections. Users scroll endlessly without navigation aids.
3. **No accessibility** — legal pages lack ARIA labels heading structure, error states with `alert` roles, and proper focus management. Screen readers have no context for interactive elements.

These issues degrade compliance. Legal content is the most visited footer section after the homepage, and must be accessible, printable, and navigable.

## What Changes

- **Refactor**: Consolidate 3 separate legal route files into a single `LegalPage.svelte` component used via thin wrappers.
  - `src/routes/impressum/+page.svelte` — thin wrapper with `pageKey="impressum"`
  - `src/routes/datenschutz/+page.svelte` — thin wrapper with `pageKey="datenschutz"`
  - `src/routes/cookie-richtlinie/+page.svelte` — thin wrapper with `pageKey="cookie-richtlinie"`
  - `src/lib/components/LegalPage.svelte` — shared component that fetches, sanitizes, renders
- **New**: `LegalHeader.svelte` — page title, description, inline mobile TOC, print button
- **New**: `LegalNav.svelte` — sticky sidebar desktop TOC with anchor links
- **Modified**: Print support via `@media print` in `LegalPage.svelte`
- **Modified**: TOC auto-generation via `sanitizeWithIds()` using DOMParser
- **NO** new dependencies — uses existing Svelte, Tailwind, WordPress API, `sanitizeHtml()` from `html.ts`

### Capabilities

#### Modified Capabilities

- `legal-pages`: Enhanced with print support, table of contents, ARIA labels, and accessible error states for all legal route pages.

## Impact

- Modified:
  - `src/routes/impressum/+page.svelte` — simplified to thin wrapper
  - `src/routes/datenschutz/+page.svelte` — simplified to thin wrapper
  - `src/routes/cookie-richtlinie/+page.svelte` — simplified to thin wrapper
- New:

  - `src/lib/components/LegalPage.svelte` — shared legal page component
  - `src/lib/components/LegalHeader.svelte` — header with inline mobile TOC + print button
  - `src/lib/components/LegalNav.svelte` — sticky desktop TOC sidebar

- No WordPress API or data-shape changes
- No deployment-model changes
- No new dependencies
- No data migration or user-facing breaking changes
