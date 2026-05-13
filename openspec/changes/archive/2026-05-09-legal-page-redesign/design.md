# Design: Legal Page Redesign

## Architecture

The legal page architecture introduces a shared `LegalPage.svelte` component that is used by all three legal routes (impressum, datenschutz, cookie-richtlinie). Each route file imports `LegalPage` with a single `pageKey` prop, and `LegalPage` fetches content from the WordPress REST API, sanitizes it, and renders it with print support and table of contents.

```
┌──────────────────────────────────────────────────────────┐
│  src/routes/impressum/+page.svelte                        │
│  src/routes/datenschutz/+page.svelte                      │
│  src/routes/cookie-richtlinie/+page.svelte                │
│                                                           │
│  Each imports: LegalPage from $lib/components/LegalPage   │
│  Each provides: <LegalPage pageKey="impressum" />         │
│           <LegalPage pageKey="datenschutz" />              │
│           <LegalPage pageKey="cookie-richtlinie" />       │
└──────────────────────────┬────────────────────────────────┘
                           │
┌──────────────────────────▼────────────────────────────────┐
│  src/lib/components/LegalPage.svelte                       │
│                                                           │
│  - fetchLegalPage(pageKey) from $lib/api/legal             │
│  - sanitizeWithIds(content) → contentWithIds + tocSections│
│  - Loading state (spinner + status role)                   │
│  - Error state (alert role, fallback links)                │
│  - Content render with LegalHeader, LegalNav, LegalProse  │
│  - handlePrint() → window.print()                          │
└──────────────────────────┬────────────────────────────────┘
                           │
┌──────────────────────────▼────────────────────────────────┐
│  src/lib/components/LegalHeader.svelte                     │
│                                                           │
│  Props: title: string, sections: Array<{id, title}>        │
│  - Renders page title + description                        │
│  - Renders inline TOC on mobile (hidden lg+)               │
│  - Renders print button with aria-label                    │
│  - Conditionally renders TOC only if sections.length > 1   │
└──────────────────────────┬────────────────────────────────┘
                           │
┌──────────────────────────▼────────────────────────────────┐
│  src/lib/components/LegalNav.svelte                        │
│                                                           │
│  Props: sections: Array<{id, title}>                        │
│  - Sticky sidebar (`sticky top-[60px] z-40`)               │
│  - Scrollable with `max-h-[50vh] overflow-y-auto`          │
│  - Anchor links with aria-label="Zu {title} springen"      │
│  - `scroll-margin-top: 70px` on target links               │
└──────────────────────────────────────────────────────────┘
```

## Data Flow

```
1. Route file renders <LegalPage pageKey="datenschutz" />
2. LegalPage calls fetchLegalPage('datenschutz') onMount
3. fetchLegalPage queries WordPress:
     GET /wp-json/wp/v2/pages?slug=datenschutz&_fields=slug,link,modified,title,content
4. Response is parsed, sanitized, mapped to LegalDocumentPage:
     { key, title, content, canonicalUrl, modified, sourceSlug }
5. sanitizeHtml(content) strips dangerous attributes
6. DOMParser scans for <h2>/<h3> elements, sets id attributes
7. tocSections array is built from discovered headings
8. If loaded successfully → render content with LegalHeader + LegalNav
9. If error → render error card with fallback links
10. Print button calls window.print() with @media print styles applied
```

## File Structure

```
src/routes/
  impressum/
    +page.svelte        # Thin wrapper with pageKey="impressum"
  datenschutz/
    +page.svelte        # Thin wrapper with pageKey="datenschutz"
  cookie-richtlinie/
    +page.svelte        # Thin wrapper with pageKey="cookie-richtlinie"

src/lib/components/
  LegalPage.svelte      # Shared component — fetch, sanitize, render
  LegalHeader.svelte    # Page title, description, inline TOC (mobile), print button
  LegalNav.svelte       # Sticky sidebar TOC (desktop) with anchor links

src/lib/api/
  legal.ts              # fetchLegalPage(), LEGAL_PAGE_CONFIG, LegalDocumentPage type
```

## Print Layout

The print stylesheet is embedded within `LegalPage.svelte` and applies globally during print context:

```css
@media print {
  .legal-header-inline {
    display: none !important;
  }
  .legal-nav {
    display: none !important;
  }
  .legal-page {
    background: none !important;
    color: #000 !important;
  }
  .card {
    border: 1px solid #ccc !important;
    box-shadow: none !important;
    break-inside: avoid;
  }
  h2,
  h3 {
    page-break-after: avoid;
  }
  p,
  table,
  img {
    page-break-inside: avoid;
  }
}
```

Key behaviors:

- All interactive elements hidden (print button, nav sidebar, inline TOC on mobile)
- Backgrounds stripped, text forced to black
- Cards get solid borders, shadows removed
- Page-break preferences prevent content from splitting across pages

## Key Design Decisions

| Decision                                        | Rationale                                                                                    |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Single `LegalPage.svelte` component             | Eliminates duplication across 3 legal routes; each route is a thin wrapper                   |
| `sanitizeWithIds()` for TOC generation          | Auto-discovers sections from WordPress HTML — no manual TOC maintenance required             |
| `LegalHeader` on mobile + `LegalNav` on desktop | Mobile shows inline TOC above content; desktop uses sticky sidebar for persistent navigation |
| `fetchLegalPage` from WordPress REST            | Reuses existing API infrastructure; no new endpoints needed                                  |
| Print button calls `window.print()`             | Native browser print dialog, no JS print library needed                                      |
| `BREAK-INSIDE: AVOID` on cards                  | Prevents card content from splitting across printed pages                                    |
| `page-break-after: avoid` on headings           | Prevents headings from appearing alone at the bottom of a page                               |

## Risk Assessment

| Risk                                               | Mitigation                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| WordPress API downtime → legal content unavailable | Display error card with link to canonical WordPress page                     |
| TOC generation fails on malformed HTML             | `sanitizeWithIds` uses `DOMParser` with graceful fallback (numeric IDs)      |
| Print layout breaks on print                       | Test with actual browser print; use `!important` on critical rules           |
| TOC sidebar overlaps content on narrow desktop     | Use `min-w-[200px]` with `hidden lg:block` — only shows at `lg+` breakpoint  |
| Content XSS from WordPress HTML                    | `sanitizeHtml()` in `html.ts` strips all `on*` attributes, `<svg>`, `<math>` |
