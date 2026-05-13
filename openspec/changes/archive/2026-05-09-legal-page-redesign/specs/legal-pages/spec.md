# legal-page-redesign-spec

## ADDED Requirements

### Requirement: Legal Page Print Support
All legal pages (Impressum, Datenschutz, Cookie-Richtlinie) SHALL support reliable PDF printing with clean formatting, proper page breaks, and no UI chrome.

#### Scenario: Print CSS hides non-essential UI
- **WHEN** the user triggers print (via print button or Ctrl+P)
- **THEN** LegalNav, LegalHeader's print button, and the PWA install banner are hidden
- **AND** all legal-page containers use `break-inside: avoid` to prevent card splitting across pages

#### Scenario: Print layout produces clean PDF
- **WHEN** the user prints any legal page
- **THEN** the output has black text on white background, readable font sizes, and no background colors or shadows
- **AND** the page title and footer are preserved
- **AND** the legal-prose content wraps correctly with `max-width: none` in print context

#### Scenario: Print button accessible
- **WHEN** the user views any legal page
- **THEN** a print button is visible with `aria-label="Seite drucken oder als PDF speichern"`
- **AND** clicking it calls `window.print()` without page reload
- **AND** the print button has a valid SVG icon and text label

---

## ADDED Requirements

### Requirement: Legal Page Table of Contents
All legal pages with multi-section content SHALL display a table of contents — inline on mobile and as a sticky sidebar on desktop — with functional anchor links to each section.

#### Scenario: TOC auto-generated from content headings
- **WHEN** a legal page loads successfully
- **THEN** `sanitizeWithIds()` scans the HTML content for `<h2>` and `<h3>` elements
- **AND** each heading receives an `id` attribute computed from its text (slugified, `section-` prefix)
- **AND** a `tocSections` array is built from all discovered headings

#### Scenario: Desktop TOC is sticky sidebar
- **WHEN** the user is on a screen wider than `lg` breakpoint
- **THEN** the TOC appears as a sticky sidebar (`legal-nav`) with `position: sticky; top: 60px`
- **AND** clicking a TOC item scrolls to the target with `scroll-margin-top: 70px`

#### Scenario: Mobile TOC is inline header
- **WHEN** the user is on a screen at or below `lg` breakpoint
- **AND** the page has more than one TOC section
- **THEN** a condensed TOC appears inline above the main content card
- **AND** it shares the same anchor ID system as desktop

---

## ADDED Requirements

### Requirement: Legal Page Accessibility
All legal pages SHALL meet WCAG 2.1 AA baseline: proper heading hierarchy, ARIA labels, sufficient contrast, keyboard navigability, and screen reader support.

#### Scenario: ARIA labels on all interactive elements
- **WHEN** a legal page renders
- **THEN** the print button has `aria-label="Seite drucken oder als PDF speichern"`
- **AND** the TOC nav has `aria-label="Inhaltsverzeichnis"`
- **AND** each TOC link has `aria-label="Zu {section.title} springen"`
- **AND** the main content area has `id="main-content"` and `tabindex="-1"`

#### Scenario: Error state is accessible
- **WHEN** a legal page fails to load
- **THEN** the error card has `role="alert"` for screen reader announcement
- **AND** the error message uses `aria-live="polite"`
- **AND** fallback links are keyboard accessible

---

## ADDED Requirements

### Requirement: Legal Page Content Rendering
The app SHALL enhance legal page content rendering with sanitization, typography, and canonical attribution.

#### Scenario: Content is sanitized
- **WHEN** legal page content is received from the WordPress API
- **THEN** `sanitizeHtml()` strips dangerous attributes
- **AND** the content passes through `DOMParser` for structural normalization

#### Scenario: Typography is consistent
- **WHEN** legal page content renders
- **THEN** headings have `font-weight: 600` with `page-break-after: avoid`
- **AND** paragraphs have 1em bottom margin
- **AND** tables have borders on all cells

#### Scenario: Canonical URL is displayed
- **WHEN** a legal page renders successfully
- **THEN** a link to the WordPress origin page is visible
- **AND** the link opens in a new tab (`target="_blank"`)
