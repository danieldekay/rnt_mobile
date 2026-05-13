# Tasks

## Prerequisites

- `desktop-layout-foundation` change must be applied first (provides `DesktopLayout`, `RightSidebar`).

---

## Phase 1

- [x] 1.1 Add the desktop card grid to `src/routes/+page.svelte`.
  - Wrap the `{#each filteredEvents as event}` loop in a `<div class="lg:grid lg:grid-cols-2 lg:gap-4">` container.
  - On mobile the `div` renders as a block by default, preserving the existing vertical list.
  - Validate with `npm run check`.

- [x] 1.2 Thread the right sidebar filter panel in `src/routes/+page.svelte`.
  - Reuse the existing layout integration if `DesktopLayout` is already provided by `src/routes/+layout.svelte`.
  - Add a `{#snippet rightSidebar()}` block containing a `DateFilter`, a `FilterChip` row for event types, a `MusicFilterChip` row for music types, and a divider plus event count label.
  - Pass the snippet to `DesktopLayout` via the existing `rightSidebar` prop flow.
  - Keep mobile filter chips in their current inline position.
  - Validate with `npm run check`.

- [x] 1.3 Perform a visual smoke test.
  - Confirm the two-column card grid renders at widths greater than or equal to 1024 px.
  - Confirm filter chips in the right sidebar update the card grid reactively.
  - Confirm the mobile layout is unchanged below 1024 px.
  - Validate with `npm run build`.
