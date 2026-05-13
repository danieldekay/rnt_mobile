# Desktop Links Spec

## Capability: `desktop-links`

### Summary

New `/links` route showing a curated, statically-defined directory of tango-related links grouped by category. Desktop: three-column grid per section with category jump-nav sidebar. Mobile: single-column list.

---

## ADDED Requirements

### Links Directory Page

#### Scenario: Load links page
- Route `/links` is accessible and loads the curated links directory
- Page title displays "Links" in main content area
- All categories with links are displayed

#### Scenario: Display categorized links (3-column grid on desktop, 1-column mobile)
- On desktop (≥ 1024 px), links are displayed in a three-column grid within each category section
- On mobile (< 1024 px), links are displayed in a single-column list
- Empty categories are omitted from the page
- "Keine Links vorhanden" is shown if no links exist

#### Scenario: Category jump-navigation sidebar on desktop
- Right sidebar on desktop contains in-page jump links (one per category)
- Sidebar includes a "Link vorschlagen" `mailto:` button at the bottom
- Sidebar is hidden on mobile
- Jump links scroll the page to the corresponding category section

### Files Added
- `src/routes/links/+page.svelte` — page component with category sections and link cards
- `src/lib/content/links.ts` — static data file with category definitions and link entries

---

### Behaviour

#### Category Sections

- Each category is a section with a heading and a grid of link cards
- Categories include: Musik, Lehrvideos, Community, Veranstaltungsportale, Organisationen, Apps & Tools

#### Link Card

- Link title as anchor (external, `target="_blank" rel="noopener noreferrer"`)
- Short description (optional)
- Domain shown as muted subtitle

#### Right Sidebar (desktop)

- In-page jump navigation: one anchor per category
- "Link vorschlagen" `mailto:` button at the bottom

#### Mobile

Single-column list within each section. No sidebar.

---

### States

| State | Behaviour |
|---|---|
| Empty category | Section is omitted |
| No links at all | "Keine Links vorhanden" |

---

### Accessibility

- All external links have `rel="noopener noreferrer"`
- Category sections are keyboard-navigable anchors
- Jump links in sidebar use `href="#<category-id>"`
