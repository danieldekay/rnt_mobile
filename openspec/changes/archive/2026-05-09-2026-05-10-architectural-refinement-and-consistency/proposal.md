# Proposal: Architectural Refinement and Consistency

This change focuses on technical debt reduction, component modularity, and consistency across the codebase. As the project has grown, several patterns (like HTML decoding, date formatting, and filter chip logic) have been duplicated or implemented slightly differently across various routes.

## What Changes

### 1. Unified Utility Layer
- **HTML & Text Processing**: Consolidate `decodeHtmlEntities`, `stripHtml`, and `truncate` functions from `src/routes/blog/+page.svelte` and `src/lib/api/tribe.ts` into a single, well-tested `src/lib/utils/text.ts`.
- **Date Handling**: Extract shared date formatting logic (e.g., `formatDate`) into `src/lib/utils/date.ts` to ensure consistent locale handling (`de-DE`) across the app.

### 2. Component Decomposition
- **Shared UI Primitives**: Identify common UI patterns (like the "skeleton loader cards" used in Blog, DJs, and Veranstalter) and move them into shared components in `src/lib/components/ui/`.
- **Snippet Extraction**: Large Svelte files (like `+page.svelte`) containing complex `@render` snippets will have those snippets extracted into dedicated components where it improves re-use (e.g., a shared `FilterToolbar.svelte`).

### 3. CSS & Design System Alignment
- **Token Usage**: Audit components to ensure they strictly use Tailwind design tokens (e.g., `rounded-control`, `bg-surface-subtle`) instead of arbitrary hex codes or raw Tailwind classes (like `rounded-[12px]`).
- **Consistent Sizing**: Standardize the "button height" and "touch target" patterns across the app to ensure all interactive elements feel part of the same system.

### 4. Code Organization
- **Type Safety**: Move locally defined types in routes (like `CategoryStat` or `FeaturedMedia` in the blog route) to `src/lib/types.ts` or route-specific `.ts` files to reduce the size of `.svelte` files.
- **API Consolidation**: Standardize the `fetch` patterns and error handling between `tribe.ts` and `posts.ts`.

## Why Changes

- **Maintainability**: Centralizing logic makes it easier to fix bugs or update styles once rather than hunting through 5 different files.
- **Smaller File Sizes**: Reducing the logic inside `.svelte` files improves IDE performance and makes the templates easier to read.
- **Reliability**: Unified text and HTML processing ensures that edge cases (like weird WordPress entities) are handled correctly everywhere.
- **Developer Experience**: A more predictable directory structure and consistent naming conventions make it easier for contributors to navigate the project.

## Impact

- No changes to user-facing features, but a significantly more robust foundation for future development.
- Improved build times and smaller bundle sizes due to better code sharing.
- More consistent visual execution across different pages of the application.