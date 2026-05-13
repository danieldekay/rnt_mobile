# Desktop Blog Spec

## Capability: `desktop-blog`

### Summary

New `/blog` route displaying WordPress blog posts. Desktop: two-column card grid with category sidebar. Mobile: single-column list.

---

## ADDED Requirements

### New Route: `/blog`

#### Scenario: Load blog page
- User navigates to `/blog`
- Page fetches WP blog posts from `/wp-json/wp/v2/posts`
- Posts displayed as cards in two-column grid on desktop
- Posts displayed as single-column list on mobile
- Desktop right sidebar shows post categories and archive navigation
- Featured image thumbnail shown on each card
- Loading state shows skeleton cards
- Empty state displays "Keine Blog-Einträge vorhanden"
- API error state displays "Blog-Einträge konnten nicht geladen werden"

#### Scenario: Blog post cards
- Each card displays: featured image thumbnail, post date, title, truncated excerpt
- Card includes "Weiterlesen →" link opening to external WordPress post
- Link opens in new tab with `rel="noopener noreferrer"`
- Card is responsive and properly sized in grid

#### Scenario: Desktop sidebar navigation
- Right sidebar displays post categories as filter chips
- Archive grouped by month/year
- Total post count displayed at bottom
- Sidebar not shown on mobile

### Files Added
- `src/routes/blog/+page.ts` (load function)
- `src/routes/blog/+page.svelte` (page component)
- `src/lib/api/posts.ts` (new module with `fetchBlogPosts()`)

## MODIFIED Requirements

### Type Definitions Enhancement

#### Scenario: BlogPost type definition
- Type `BlogPost` added to `src/lib/types.ts`
- Includes fields: id, date, slug, title (with rendered property), excerpt (with rendered property), link, categories, and optional _embedded for featured media
- Supports WP REST API v2 post structure

### Files Modified
- `src/lib/types.ts` (add `BlogPost` interface)

---

### Behaviour

#### Two-Column Grid (desktop)

- Posts arranged in grid with `lg:grid-cols-2`
- Each card contains: featured image, date, title, excerpt, link
- Cards are consistent width and height

#### Single Column (mobile)

- Posts displayed in single-column list
- Same card structure as desktop

#### Right Sidebar (desktop)

- Category filter chips at top
- Archive navigation grouped by month
- Post count at bottom
- Sidebar hidden on mobile

#### States

| State | Behaviour |
|---|---|
| Loading | Skeleton cards in grid |
| Empty | "Keine Blog-Einträge vorhanden" |
| API error | "Blog-Einträge konnten nicht geladen werden" |

#### Prerender

- Route is statically prerendered
- If posts unavailable at build time, empty state renders
- Build continues without error (`handleHttpError: 'warn'`)
