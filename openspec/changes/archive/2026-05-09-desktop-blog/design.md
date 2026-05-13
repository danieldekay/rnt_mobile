## Design

### Overview

New route `src/routes/blog/` with data load from WP REST API, card grid on desktop, single column on mobile, category sidebar.

### Affected Files

| File | Change type | Notes |
|---|---|---|
| `src/routes/blog/+page.ts` | **New** | Load function — fetch WP posts |
| `src/routes/blog/+page.svelte` | **New** | Blog post list page |
| `src/lib/api/posts.ts` | **New** | `fetchBlogPosts()` helper |
| `src/lib/types.ts` | Edit | Add `BlogPost` type |

### BlogPost Type

```ts
export interface BlogPost {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  link: string;
  categories: number[];
  _embedded?: { 'wp:featuredmedia'?: [{ source_url: string; alt_text: string }] };
}
```

### API Function (`src/lib/api/posts.ts`)

```ts
const WP_BASE = 'https://www.rhein-neckar-tango.de/wp-json/wp/v2';

export async function fetchBlogPosts(perPage = 20): Promise<BlogPost[]> {
  const res = await fetch(`${WP_BASE}/posts?per_page=${perPage}&_embed`);
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
  return res.json();
}
```

### Load Function

```ts
// +page.ts
export async function load({ fetch }) {
  try {
    const posts = await fetchBlogPosts();
    return { posts };
  } catch {
    return { posts: [] };
  }
}
```

### Desktop Layout Structure

```
DesktopLayout
  main:
    heading "Blog"
    [PostCard] [PostCard]   ← lg:grid-cols-2
    [PostCard] [PostCard]
  rightSidebar:
    category filter chips
    ─── divider ───
    post count
```

### PostCard Component

- Inline in `+page.svelte` initially (extract `PostCard.svelte` if reused).
- Shows: featured image thumbnail, post date, title, truncated excerpt, "Weiterlesen →" link to `post.link` (external, target="_blank" rel="noopener noreferrer").

### Prerender

Route is static; if API call fails at build time, empty state renders. `handleHttpError: 'warn'` is already configured.

### Validation

```bash
npm run check
npm run build
```
