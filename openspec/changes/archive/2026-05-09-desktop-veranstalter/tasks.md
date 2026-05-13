# Tasks

## Prerequisites

- [x] `desktop-layout-foundation` applied.
- [x] `fetchOrganizers` added to `tribe.ts` (can be done here or in `desktop-djs` - coordinate).

---

## Task List

### T1 — Confirm/add `fetchOrganizers` in `tribe.ts`
- [x] **File**: `src/lib/api/tribe.ts` - if `desktop-djs` already added this function, reuse it; else add it here.
- [x] Confirm `TribeOrganizer` type in `src/lib/types.ts`; add if missing.
- [x] Validate with `npm run check`.

### T2 — Create `src/routes/veranstalter/+page.ts`
- [x] Create load function that reuses `fetchOrganizers()` and returns `{ organizers }` with error fallback.
- [x] Add organizer event count and city/region derivation for UI filtering.
- [x] Validate with `npm run check`.

### T3 — Create `src/routes/veranstalter/+page.svelte`
- [x] Add heading "Veranstalter".
- [x] Add `lg:grid-cols-2 lg:gap-4` card grid.
- [x] Render cards with photo/logo, name, city/region (if available), website link, and event count.
- [x] Add right sidebar city/region filter chips plus shown-organizer count.
- [x] Keep mobile single-column behavior.
- [x] Include loading, empty, and API error states.
- [x] Validate with `npm run check`.

### T4 — Verify prerender
- [x] Run `npm run build`.
