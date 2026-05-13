# Tasks

## Prerequisites

- [x] `desktop-layout-foundation` applied.

---

## Task List

### T1 — Add `BlogPost` type
**File**: `src/lib/types.ts`
- [x] Add `BlogPost` interface (see design.md).
- [x] Validate with `npm run check`.

### T2 — Create `src/lib/api/posts.ts`
- [x] Implement `fetchBlogPosts(perPage = 20)` using `fetch` (see design.md).
- [x] Export function.
- [x] Validate with `npm run check`.

### T3 — Create `src/routes/blog/+page.ts`
- [x] Load function calls `fetchBlogPosts`, returns `{ posts }`, and catches errors with fallback `[]`.
- [x] Validate with `npm run check`.

### T4 — Create `src/routes/blog/+page.svelte`
- [x] Add heading "Blog".
- [x] Mobile: single-column post card list.
- [x] Desktop: `lg:grid-cols-2 lg:gap-4` card grid.
- [x] Each card has featured image (or placeholder), date, title, excerpt, and "Weiterlesen" link.
- [x] Add right sidebar snippet with category filter chips and count.
- [x] Validate with `npm run check`.

### T5 — Verify prerender
- [x] Run `npm run build`; build must succeed even if posts API is unavailable.
