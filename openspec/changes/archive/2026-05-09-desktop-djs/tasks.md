# Tasks

## Prerequisites

- [x] `desktop-layout-foundation` applied.

---

## Task List

### T1 — Add `fetchOrganizers` to `tribe.ts`
- [x] **File**: `src/lib/api/tribe.ts` — implement `fetchOrganizers()` as paginated GET to `/organizers` (see design.md).
- [x] Confirm `TribeOrganizer` type in `src/lib/types.ts`; add if missing.
- [x] Validate with `npm run check`.

### T2 — Create `src/routes/djs/+page.ts`
- [x] Create load function that calls `fetchOrganizers`, filters for DJ entries (by name match or custom field), and returns `{ organizers }`.
- [x] Validate with `npm run check`.

### T3 — Create `src/routes/djs/+page.svelte`
- [x] Add heading "DJs".
- [x] Add `lg:grid-cols-3 lg:gap-4` card grid.
- [x] Add right sidebar music-style filter and count behavior.
- [x] Keep mobile single-column list behavior.
- [x] Validate with `npm run check`.

### T4 — Verify prerender
- [x] Run `npm run build`.
