# Tasks: Legal Page Redesign

## Task Group: LegalPage Shared Component

### Task 1.0: Create LegalPage component

**File:** `src/lib/components/LegalPage.svelte`
**Dependencies:** `src/lib/api/legal.ts`, `LegalHeader.svelte`, `LegalNav.svelte`

Implement the shared LegalPage component that fetches legal content from WordPress, sanitizes it, generates a table of contents, and renders with three states (loading, error, content).

**Implementation details:**

- Accepts `{ pageKey: LegalPageKey }` prop from route
- On mount: `fetchLegalPage(pageKey)` to get `LegalDocumentPage`
- `sanitizeWithIds(content)` function using DOMParser + regex:
  - Parses HTML with `DOMParser`
  - Finds all `<h2>` and `<h3>` elements
  - For each heading: slugifies text → `section-{slug}` ID
  - Sets `id` attribute on each heading
  - Returns `{ contentWithIds: string, tocSections: Array<{id, title}> }`
- `$derived` for `fallback = LEGAL_PAGE_CONFIG[pageKey]`
- `$derived.by` for `formattedModified` (German locale date)
- `handlePrint()` calls `window.print()`

**States:**

- **Loading**: Spinner with "Lade Rechtsinformationen…" + `role="status"`, `aria-live="polite"`
- **Error**: Card with "Rechtsseite nicht verfügbar", error message, fallback links
- **Content**: LegalHeader + LegalNav (desktop) / inline TOC (mobile) + prose content

**Print Styles (`@media print`):**

- Hide `.legal-header-inline`, `.legal-nav`, print button
- `background: none !important`, `color: #000 !important` on legal-page
- `break-inside: avoid` on cards
- `page-break-after: avoid` on h2/h3
- `page-break-inside: avoid` on p, table, img

**Acceptance:**

- [ ] Component compiles without TypeScript errors
- [ ] Loading state shows spinner with correct ARIA attributes
- [ ] Error state shows alert card with fallback links
- [ ] Content state renders LegalHeader + content with print-ready CSS
- [ ] `sanitizeWithIds()` generates correct section IDs from headings
- [ ] Print CSS hides all interactive elements and cleans up layout

---

### Task 1.1: Add LegalHeader component

**File:** `src/lib/components/LegalHeader.svelte`

Create the mobile-first legal page header with title, description, inline TOC, and print button.

**Props:** `title: string`, `sections: Array<{id: string, title: string}>`

**Behavior:**

- Renders `<h1>` with title + description text
- Renders inline TOC (`<nav aria-label="Inhaltsverzeichnis">`) only when `sections.length > 1`
- Links within inline TOC point to `#{section.id}` anchors
- Print button with SVG icon, text "Drucken", `aria-label="Seite drucken oder als PDF speichern"`

**Acceptance:**

- [ ] Header renders title and description correctly
- [ ] Inline TOC hidden on screens ≥ `lg` breakpoint (`hidden lg:none` on inline container)
- [ ] Print button calls `window.print()` on click
- [ ] ARIA labels present on all interactive elements

---

### Task 1.2: Add LegalNav sticky sidebar component

**File:** `src/lib/components/LegalNav.svelte`

Create the desktop sticky sidebar TOC for legal pages with multi-section content.

**Props:** `sections: Array<{id: string, title: string}>`

**Behavior:**

- Sticky sidebar with `position: sticky`, `top: 60px`, `z-40`
- Scrollable with `max-h-[50vh] overflow-y-auto`
- Each section is a link to `#{section.id}` with `aria-label="Zu {title} springen"`
- `scroll-margin-top: 70px` on target links (via style rule `.legal-nav a:target`)

**Style rules:**

- Nav container: `bg-surface-canvas/95 backdrop-blur-sm rounded-control border border-border-default p-4`
- Active section highlight: `.legal-nav a:target { scroll-margin-top: 70px; }`

**Acceptance:**

- [ ] Sidebar is sticky at 60px from top during scroll
- [ ] Links scroll to headings with 70px scroll offset
- [ ] Maximum height of 50vh with overflow auto
- [ ] Proper ARIA labels on all links and nav element

---

### Task 1.3: Simplify route files to thin wrappers

**File:** `src/routes/impressum/+page.svelte`
**File:** `src/routes/datenschutz/+page.svelte`
**File:** `src/routes/cookie-richtlinie/+page.svelte`

Reduce each route file to a thin wrapper that only sets the `pageKey` prop and imports `LegalPage`.

**Pattern for all three:**

```svelte
<script lang="ts">
    import LegalPage from '$lib/components/LegalPage.svelte';
</script>

<svelte:head>
    <title>Page Title - RNT Kalender</title>
</svelte:head>

<LegalPage pageKey="impressum" />
<!-- (replace with datenschutz / cookie-richtlinie) -->
```

**Existing content to strip:**

- Remove `import { resolve }` imports
- Remove standalone `LegalPage.svelte` component code
- Remove duplicate `LegalHeader.svelte` / `LegalNav.svelte` code
- Remove `sanitizeWithIds`, `handlePrint`, `fetchLegalPage` calls
- Keep only svelte:head title tag and LegalPage wrapper

**Acceptance:**

- [ ] All three routes compile without errors
- [ ] Impressum route shows "Impressum - RNT Kalender" in `<title>`
- [ ] Datenschutz route shows "Datenschutzerklärung - RNT Kalender" in `<title>`
- [ ] Cookie-Richtlinie route shows "Cookie-Richtlinie - RNT Kalender" in `<title>`
- [ ] Each route renders legal content via shared LegalPage component

---

## Task Group: Print Support

### Task 2.0: Add print media query to LegalPage

**File:** `src/lib/components/LegalPage.svelte`

Add `@media print` CSS rules within the LegalPage component's `<style>` block.

**CSS rules:**

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
  /* headings and content */
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

**Acceptance:**

- [ ] Print stylesheet is within `<style>` block (not in separate file)
- [ ] Print button, nav, and inline TOC hidden in print context
- [ ] Background stripped, text color forced to black
- [ ] `page-break-after: avoid` on headings, `break-inside: avoid` on containers

---

### Task 2.1: Verify print layout

**File:** (no code change, manual verification)

Test print output across browsers:

- Chrome (desktop + mobile)
- Safari (desktop + iOS)
- Firefox

Check:

- [ ] Print preview shows clean layout
- [ ] No backgrounds, shadows, or colors in print
- [ ] Page breaks occur at logical boundaries (not mid-card)
- [ ] No UI chrome (nav, TOC, buttons) visible in print output
- [ ] Text is black at 100%, readable at all font sizes

---

## Task Group: Table of Contents

### Task 3.0: Implement TOC auto-generation in sanitizeWithIds

**File:** `src/lib/components/LegalPage.svelte`

Implement the `sanitizeWithIds(content)` function within LegalPage that scans HTML for headings and assigns IDs.

**Algorithm:**

1. Parse HTML with `new DOMParser().parseFromString(html, 'text/html')`
2. Select all `<h2>` and `<h3>` elements
3. For each heading:
   - Get text content, trim whitespace
   - Replace non-alphanumeric chars with empty (keeping umlauts: ä, ö, ü, ß)
   - Replace whitespace with hyphens
   - Prepend `section-` prefix
   - Set id attribute on heading element
   - Push `{id, title: textContent}` to sections array
4. Return `{ contentWithIds: doc.body.innerHTML, tocSections: Section[] }`

**Acceptance:**

- [ ] `sanitizeWithIds()` returns valid `{ contentWithIds, tocSections }` object
- [ ] Each heading has a unique `id` attribute in returned HTML
- [ ] IDs are slugified versions of heading text
- [ ] `tocSections` array has entries matching the number of h2/h3 headings
- [ ] Non-heading elements are not modified

---

### Task 3.1: Wire TOC to LegalHeader and LegalNav

**File:** `src/lib/components/LegalPage.svelte`
**File:** `src/lib/components/LegalHeader.svelte`
**File:** `src/lib/components/LegalNav.svelte`

Connect the generated `tocSections` to the header and nav components.

**LegalPage.svelte:**

- Pass `tocSections` as prop to both `LegalHeader` and `LegalNav`
- Conditionally render `LegalNav` only when `tocSections.length > 1` on `lg`+ screens
- Conditionally render `LegalHeader`'s inline TOC only on screens ≤ `lg`

**LegalHeader.svelte:**

- Accept `sections` prop, render inline TOC when `sections.length > 1`
- Hidden on `lg`+ screens

**LegalNav.svelte:**

- Accept `sections` prop, render sticky sidebar always (desktop only)
- Hidden on mobile

**Acceptance:**

- [ ] Single-section pages show no TOC (neither inline nor sidebar)
- [ ] Multi-section pages show inline TOC on mobile, sidebar on desktop
- [ ] TOC links correctly point to section headings
- [ ] Sidebar is sticky and scrolls independently of content

---

## Task Group: Accessibility

### Task 4.0: Add ARIA labels and roles to LegalPage

**File:** `src/lib/components/LegalPage.svelte`

Ensure all interactive elements and states have proper ARIA for screen readers.

**Required ARIA:**

- Loading state: `role="status"`, `aria-live="polite"` on spinner container
- Error state: `role="alert"` on error card container
- Main content: `id="main-content"`, `tabindex="-1"` on `<main>` element
- Print button: `aria-label="Seite drucken oder als PDF speichern"`
- TOC nav: `aria-label="Inhaltsverzeichnis"`
- TOC links: `aria-label="Zu {section.title} springen"`

**Acceptance:**

- [ ] Every interactive element has appropriate ARIA label or role
- [ ] Error card announces on screen reader via `role="alert"`
- [ ] Loading state announces via `aria-live="polite"`
- [ ] Main content is focusable via `tabindex="-1"`

---

### Task 4.1: Verify error state accessibility

**File:** `src/lib/components/LegalPage.svelte`

Ensure the error state has proper fallback navigation.

**Requirements:**

- Error card has "Rechtsseite nicht verfügbar" heading
- Error message displays the caught exception message or German fallback
- "Auf Originalseite lesen" button links to `fallback.canonicalUrl` (opens new tab)
- "Zur Startseite" button links back to `/`
- Both fallback buttons are keyboard accessible with visible focus rings

**Acceptance:**

- [ ] Error state renders when `fetchLegalPage` throws
- [ ] Error card has `role="alert"`
- [ ] Fallback links are both keyboard and mouse accessible
- [ ] Visual distinction between error state and content state

---

## Task Group: Integration Testing

### Task 5.0: Test all legal pages end-to-end

**File:** (manual testing, no code change)

Verify all three legal pages work correctly:

- [ ] **Impressum**: Loads properly, shows correct title, content renders
- [ ] **Datenschutz**: Loads properly, TOC generated from h2/h3 headings, print button works
- [ ] **Cookie-Richtlinie**: Loads properly, all sections displayed with links
- [ ] **All pages**: Print produces clean output
- [ ] **All pages**: Error state shows when API fails
- [ ] **All pages**: Mobile layout works (inline TOC, full-width content)
- [ ] **All pages**: Desktop layout works (sidebar TOC, two-column)
- [ ] **All pages**: ARIA attributes present and correct
- [ ] **All pages**: Links are keyboard accessible

---

### Task 5.1: Test print across browsers

**File:** (manual testing, no code change)

Verify print layout:

- [ ] Chrome (desktop): Print preview is clean, no backgrounds
- [ ] Safari (desktop): Print preview is clean, page breaks at correct points
- [ ] Safari (iOS): Print from share sheet produces clean PDF
- [ ] Firefox (desktop): Print matches Chrome/Safari output
- [ ] Print with images: Images scale to fit page
- [ ] Print with long content: Multiple pages generated correctly

---

### Task 5.2: Test accessibility across devices

**File:** (manual testing, no code change)

Verify accessibility:

- [ ] Screen reader (VoiceOver iOS): Reads heading hierarchy correctly
- [ ] Screen reader (NVDA Windows): Announces TOC and links properly
- [ ] Keyboard-only (mobile): Can navigate all links with focus order
- [ ] Keyboard-only (desktop): Tab order is logical (back → header → TOC → content → print)
- [ ] Color contrast: All text meets minimum 4.5:1 ratio (normal), 3:1 (heading/links)
