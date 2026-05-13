## Design

### Affected Files

| File | Change type | Notes |
|---|---|---|
| `src/routes/ankuendigungen/+page.ts` | **New** | Load function |
| `src/routes/ankuendigungen/+page.svelte` | **New** | Announcements page |
| `src/lib/api/posts.ts` | Edit | Add `fetchAnnouncements` |

### API Function Addition

```ts
// In src/lib/api/posts.ts
export async function fetchAnnouncements(perPage = 20): Promise<BlogPost[]> {
  // Use category slug 'ankuendigungen' — confirm actual slug/ID from WP API
  const res = await fetch(`${WP_BASE}/posts?categories=<ID>&per_page=${perPage}&_embed`);
  if (!res.ok) return []; // fallback to empty on error
  return res.json();
}
```

> **Note**: The category ID or slug for "Ankündigungen" must be verified against the live WP API before implementation. If no dedicated category exists, fall back to all posts tagged "ankuendigung" or a hardcoded ID from the API response.

### Desktop Layout Structure

```
DesktopLayout
  main:
    heading "Ankündigungen"
    FeaturedAnnouncement (first post, full-width card with larger text)
    list of remaining announcements (single-column, compact)
  rightSidebar:
    Archive navigation (month / year grouped)
    ─── divider ───
    count
```

### Mobile

Single-column list of announcement cards.

### Validation

```bash
npm run check && npm run build
```
