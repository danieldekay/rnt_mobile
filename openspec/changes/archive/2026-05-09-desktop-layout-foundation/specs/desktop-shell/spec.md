# Desktop Shell Spec

## Capability: `desktop-shell`

### Summary

Responsive three-column layout shell that activates the 240 px fixed left navigation sidebar and optional right contextual sidebar at screen widths ≥ 1024 px. Below that breakpoint the layout is identical to the existing mobile-first design.

---

## ADDED Requirements

### Desktop Layout Shell

#### Scenario: Desktop layout renders at 1024px+
- At viewport width ≥ 1024 px, the desktop shell with left sidebar (240 px) and optional right sidebar renders correctly
- Main content area is constrained to max 800 px
- Three-column CSS grid is properly initialized with correct spacing
- All child components render without layout shift

#### Scenario: Mobile layout unchanged
- At viewport width < 1024 px, the existing mobile layout remains unchanged
- No new markup introduced; existing flex-column structure preserved
- App displays identically to before this change

#### Scenario: Left sidebar navigation visible on desktop
- Primary navigation links (Veranstaltungen, Kalender, Blog, Ankündigungen, DJs, Veranstalter, Tanzräume, Links) are visible in left sidebar
- Active route is visually highlighted with teal accent
- Sidebar is hidden on mobile using responsive utilities
- Navigation is persistent and always accessible on desktop

### Files Added
- `src/lib/components/DesktopLayout.svelte`
- `src/lib/components/LeftSidebar.svelte`
- `src/lib/components/RightSidebar.svelte`

## MODIFIED Requirements

### Root Layout Integration

#### Scenario: Root layout integrates DesktopLayout wrapper
- The global `src/routes/+layout.svelte` uses the new DesktopLayout component
- DesktopLayout conditionally renders left sidebar on desktop (≥ 1024 px)
- Route children are rendered in the main column
- RightSidebar slot is available for route-specific content

#### Scenario: CSS utilities and custom properties
- New CSS custom properties added to `src/app.css` for sidebar widths and colors
- Tailwind utilities available for desktop layout spacing and sizing
- Grid layout properly constrained with responsive breakpoints

### Files Modified
- `src/routes/+layout.svelte` — import and wrap content with `<DesktopLayout>`
- `src/app.css` — add CSS custom properties and utilities for responsive grid

---

### Behaviour

#### Breakpoint

| Viewport width | Layout rendered |
|---|---|
| < 1024 px | Single column (mobile-first, unchanged) |
| ≥ 1024 px | Three-column grid (left sidebar + main + optional right sidebar) |

#### Left Sidebar Navigation

- Fixed width: 240 px
- Primary nav links with route highlighting
- Hidden on mobile
- Always visible on desktop

#### Right Sidebar

- Optional slot for route-specific content
- Collapses on narrow viewports
- Hidden on mobile

---

### States

| State | Behaviour |
|---|---|
| Mobile (< 1024 px) | No sidebars, single column |
| Desktop (≥ 1024 px) | Both sidebars visible (right sidebar optional by route) |
