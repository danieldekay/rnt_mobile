# Tasks

## Prerequisites

- [x] `desktop-layout-foundation` applied.

---

## Task List

### T1 — Add `fetchVenues` to `tribe.ts`
- [x] **File**: `src/lib/api/tribe.ts` — implement `fetchVenues()` (see design.md).
- [x] Confirm/add `TribeVenue` type in `src/lib/types.ts` (fields: `id`, `venue`, `address`, `city`, `geo_lat`, `geo_lng`, `website`).
- [x] Validate with `npm run check`.

### T2 — Create `src/routes/tanzraeume/+page.ts`
- [x] Load `fetchVenues()`, return `{ venues }`, and provide error fallback `[]`.
- [x] Validate with `npm run check`.

### T3 — Create `src/routes/tanzraeume/+page.svelte`
- [x] Add heading "Tanzräume".
- [x] Add `lg:grid-cols-2 lg:gap-4` card grid.
- [x] Render cards with name, address, Maps link (if coords), and upcoming count.
- [x] Add right sidebar city filter chips + shown count.
- [x] Keep mobile single-column behavior.
- [x] Validate with `npm run check`.

### T4 — Verify prerender
- [x] Run `npm run build`.
