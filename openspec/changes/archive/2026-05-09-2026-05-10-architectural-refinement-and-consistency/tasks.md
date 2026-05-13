# Tasks: Architectural Refinement and Consistency

## Phase 1: Utility Consolidation

- [x] 1.1 Create `src/lib/utils/text.ts`
    - Port `decodeHtmlEntities`, `stripHtmlToPlainText`, `normalizeText`, and `truncate` logic.
    - Consolidate the `HTML_ENTITY_MAP` from `tribe.ts` and `blog/+page.svelte`.
- [x] 1.2 Create `src/lib/utils/date-formatting.ts`
    Port shared logic for `formatDate`, `getPopupDate`, and `formatNextEventDate` into a unified helper using `date-fns` where appropriate.
- [x] 1.3 Refactor `src/lib/api/tribe.ts` and `src/routes/blog/+page.svelte`
    - Replace local helper functions with imports from the new utility files.
    - Standardize error handling classes (e.g., `EventFetchError`).

## Phase 2: Component Refactoring & Re-use

- [x] 2.1 Create shared Skeleton components
    - Extract common pulse-loading patterns into `src/lib/components/SkeletonCard.svelte` or similar.
    - Update Blog, DJ, and Organizer pages to use the shared skeleton.
- [x] 2.2 Componentize the Filter Toolbar
    - Extract the filter logic/UI from `src/routes/+page.svelte` and `src/routes/djs/+page.svelte` into a more reusable `FilterBar` component if applicable.
- [x] 2.3 Cleanup `src/lib/types.ts`
    - Move post-load data structures (e.g., `DjProfileSummary`, `OrganizerWithStats`, `BlogPost`) into central types or dedicated namespace files to thin out component scripts.

## Phase 3: Design System Consistency

- [x] 3.1 Audit and Replace Hardcoded Values
    - Search for arbitrary hex codes (e.g., in `djs/+page.svelte`) and replace them with CSS variables or Tailwind utility classes defined in `src/app.css`.
    - Standardize `rounded-[12px]` to a project token like `rounded-card`.
- [x] 3.2 Standardize Button/Control Heights
    - Ensure all interactive "pill" and "action" buttons use the same `min-h-11` or `min-h-12` constraints and consistent font sizes.

## Phase 4: Validation

- [x] 4.1 Global Type Check
    - Run `npm run check` to ensure all imports and type moves were successful.
- [x] 4.2 Regression Testing
    - Verify that HTML entities still render correctly on Blog and Event pages.
    - Ensure date filters and searching still work as expected across all routes.