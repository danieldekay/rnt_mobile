## Why

The RNT website publishes blog posts accessible via the WordPress REST API (`/wp-json/wp/v2/posts`). The current app has no blog section. Adding a desktop blog page surfaces this content to users who visit on desktop and provides an additional engagement touchpoint for the tango community.

## What Changes

- Add new route `src/routes/blog/` with `+page.svelte` and `+page.ts` (load function).
- `+page.ts`: fetches posts from `/wp-json/wp/v2/posts?per_page=20&_embed` and returns them; handles errors gracefully.
- `+page.svelte`: renders blog post cards in a two-column grid on desktop; single column on mobile. Uses `DesktopLayout` with a right sidebar showing post categories / archive navigation.
- Add `fetchBlogPosts()` function to `src/lib/api/tribe.ts` (or a new `src/lib/api/posts.ts` module).
- Add TypeScript type `BlogPost` to `src/lib/types.ts`.
- Add nav link "Blog" to `LeftSidebar` (already included in the foundation change's nav list).
- Route is prerendered; add to `+layout.ts` or handle `handleHttpError: 'warn'` if posts are unavailable at build time.

## Capabilities

### New Capabilities

- `desktop-blog`: Blog post list page — fetches WP posts, renders card grid on desktop; single column on mobile; category/archive sidebar on desktop.

### Modified Capabilities

None — this is a wholly new route.

## Impact

- **New files**: `src/routes/blog/+page.svelte`, `src/routes/blog/+page.ts`
- **Files changed**: `src/lib/types.ts` (add `BlogPost` type), `src/lib/api/tribe.ts` or new `src/lib/api/posts.ts`
- **New API endpoint**: `https://www.rhein-neckar-tango.de/wp-json/wp/v2/posts`
- **Prerender**: new static route, must build without errors (posts may be empty — handle gracefully)
- **Depends on**: `desktop-layout-foundation`
- **Stitch reference**: https://stitch.withgoogle.com/projects/6101620989348291389 (Blog screen)
