# legal-page-redesign-spec

## Capability: Legal Page Print Support

### Description

All legal pages (Impressum, Datenschutz, Cookie-Richtlinie) MUST support reliable PDF printing with clean formatting, proper page breaks, and no UI chrome (navbars, TOC, print buttons hidden in print output).

### Requirements

#### REQ-1: Print CSS hides non-essential UI

- **WHEN** the user triggers print (via print button or Ctrl+P)
- **THEN** LegalNav, LegalHeader's print button, and the PWA install banner are hidden
- **AND** all legal-page containers use `break-inside: avoid` to prevent card splitting across pages

#### REQ-2: Print layout produces clean PDF

- **WHEN** the user prints any legal page
- **THEN** the output has black text on white background, readable font sizes, and no background colors or shadows
- **AND** the page title and footer are preserved
- **AND** the legal-prose content wraps correctly with `max-width: none` in print context

#### REQ-3: Print button accessible

- **WHEN** the user views any legal page
- **THEN** a print button is visible with `aria-label="Seite drucken oder als PDF speichern"`
- **AND** clicking it calls `window.print()` without page reload
- **AND** the print button has a valid SVG icon and text label

---

## Capability: Legal Page Table of Contents

### Description

All legal pages with multi-section content MUST display a table of contents — inline on mobile and as a sticky sidebar on desktop — with functional anchor links to each section.

### Requirements

#### REQ-4: TOC auto-generated from content headings

- **WHEN** a legal page loads successfully
- **THEN** `sanitizeWithIds()` scans the HTML content for `<h2>` and `<h3>` elements
- **AND** each heading receives an `id` attribute computed from its text (slugified, `section-` prefix)
- **AND** a `tocSections` array is built from all discovered headings

#### REQ-5: Desktop TOC is sticky sidebar

- **WHEN** the user is on a screen wider than `lg` breakpoint
- **THEN** the TOC appears as a sticky sidebar (`legal-nav`) with `position: sticky; top: 60px`
- **AND** the sidebar has `z-40` above content but below floating headers
- **AND** clicking a TOC item scrolls to the target with `scroll-margin-top: 70px`

#### REQ-6: Mobile TOC is inline header

- **WHEN** the user is on a screen at or below `lg` breakpoint
- **AND** the page has more than one TOC section
- **THEN** a condensed TOC appears inline above the main content card
- **AND** it shares the same anchor ID system as desktop
- **AND** the inline TOC is hidden on screens wider than `lg`

#### REQ-7: Single-section pages hide TOC

- **WHEN** the loaded legal page has 0 or 1 TOC section
- **THEN** no TOC is displayed (neither sidebar nor inline)
- **AND** the content card takes full width without sidebar gap

---

## Capability: Legal Page Accessibility

### Description

All legal pages MUST meet WCAG 2.1 AA baseline: proper heading hierarchy, ARIA labels, sufficient contrast, keyboard navigability, and screen reader support.

### Requirements

#### REQ-8: Heading hierarchy is valid

- **WHEN** a legal page renders
- **THEN** `<h1>` contains the page title exactly once
- **AND** `<h2>` elements are used for main sections
- **AND** `<h3>` elements are used for subsections
- **AND** no heading level is skipped (e.g., h1 → h3 without h2)

#### REQ-9: ARIA labels on all interactive elements

- **WHEN** a legal page renders
- **THEN** the print button has `aria-label="Seite drucken oder als PDF speichern"`
- **AND** the TOC nav has `aria-label="Inhaltsverzeichnis"`
- **AND** each TOC link has `aria-label="Zu {section.title} springen"`
- **AND** the main content area has `id="main-content"` and `tabindex="-1"`

#### REQ-10: Error state is accessible

- **WHEN** a legal page fails to load
- **THEN** the error card has `role="alert"` for screen reader announcement
- **AND** the error message uses `aria-live="polite"`
- **AND** fallback links are keyboard accessible
- **AND** the error state is distinguished from content by visual styling (border, background)

#### REQ-11: Sufficient color contrast

- **WHEN** any legal page renders
- **THEN** text on background meets minimum 4.5:1 contrast ratio for normal text
- **AND** headings meet minimum 3:1 contrast ratio
- **AND** interactive elements (buttons, links) meet 3:1 contrast against adjacent colors
- **AND** link hover states maintain visibility

---

## Capability: Legal Page Responsive Design

### Description

All legal pages MUST render correctly across mobile (320px+), tablet (768px+), and desktop (1024px+) viewports with appropriate layout adjustments.

### Requirements

#### REQ-12: Mobile-first layout

- **WHEN** the user views a legal page on a mobile viewport (< 768px)
- **THEN** the content card takes full width with `px-4` padding
- **AND** the heading is full-size (`text-[2rem]`) with responsive adjustment
- **AND** the TOC (if present) is inline above the content card

#### REQ-13: Desktop two-column layout

- **WHEN** the user views a legal page on a desktop viewport (>= 1024px)
- **AND** the page has more than one TOC section
- **THEN** the layout uses `flex flex-col lg:flex-row` with a min-width TOC sidebar (200px)
- **AND** the main content area uses `flex-1` for remaining space
- **AND** the sidebar is `sticky` and scrolls independently

#### REQ-14: Print media query

- **WHEN** the media query `print` is active
- **THEN** all background colors are removed (`background: none`)
- **AND** text color is forced to black (`color: #000`)
- **AND** card borders become thin solid lines
- **AND** shadow effects are removed (`box-shadow: none`)
- **AND** heading breaks are preferred (`page-break-after: avoid`)
- **AND** content blocks avoid page-break-inside

---

## Capability: Legal Page Error Handling

### Description

All legal pages MUST handle loading, network failures, and empty responses gracefully with user-friendly error states and fallback options.

### Requirements

#### REQ-15: Loading state with spinner

- **WHEN** a legal page is loading (before API response)
- **THEN** a spinner is displayed with text "Lade Rechtsinformationen..."
- **AND** the spinner uses `role="status"` and `aria-live="polite"`
- **AND** the user cannot interact with the page during loading

#### REQ-16: Network error state

- **WHEN** the WordPress API returns a non-200 response
- **THEN** an error card is shown with "Rechtsseite nicht verfügbar"
- **AND** the specific error message from the API is displayed
- **AND** a link to the canonical origin page is available ("Auf Originalseite lesen")
- **AND** a "Zur Startseite" link is available for navigation

#### REQ-17: Empty response state

- **WHEN** the WordPress API returns a response with no pages for the requested slug
- **THEN** the same error state as network error is displayed
- **AND** the error message indicates the page is currently unavailable

---

## Capability: Legal Page Content Rendering

### Description

Legal page content rendered from WordPress MUST be sanitized, formatted with proper typography, and display correctly in both screen and print contexts.

### Requirements

#### REQ-18: Content is sanitized

- **WHEN** legal page content is received from the WordPress API
- **THEN** `sanitizeHtml()` strips dangerous attributes (`on*`, `<svg>`, `<math>`)
- **AND** the content passes through `DOMParser` for structural normalization
- **AND** no scripts or event handlers are preserved in the output

#### REQ-19: Typography is consistent

- **WHEN** legal page content renders
- **THEN** headings have `font-weight: 600` with `page-break-after: avoid`
- **AND** paragraphs have 1em bottom margin
- **AND** lists have proper spacing with bullets
- **AND** tables have borders on all cells with 0.5em padding
- **AND** images are `max-width: 100%; height: auto`

#### REQ-20: Canonical URL is displayed

- **WHEN** a legal page renders successfully
- **THEN** a link to the WordPress origin page is visible
- **AND** the link opens in a new tab (`target="_blank"` with `rel="noopener noreferrer"`)
- **AND** the link label reads "Originalseite öffnen"

---

## Capability: Legal Page Footer Info

### Description

Legal pages MUST display modification dates and source attribution for transparency and compliance.

### Requirements

#### REQ-21: Modified date displayed

- **WHEN** a legal page has a `modified` field from the WordPress API
- **THEN** the last-modified date is displayed in German locale format
- **AND** the label reads "Zuletzt aktualisiert: {date}"
- **AND** the date is formatted with `toLocaleDateString('de-DE', ...)`

#### REQ-22: Footer attribution

- **WHEN** a legal page renders
- **THEN** footer text reads "In-App-Spiegel der rechtlich maßgeblichen Originalseite von Rhein-Neckar-Tango"
- **AND** the content includes a link to the canonical WordPress page
