## Design

### Affected Files

| File | Change type | Notes |
|---|---|---|
| `src/routes/links/+page.svelte` | **New** | Links directory page |
| `src/lib/content/links.ts` | **New** | Static curated link data |

### Data Structure (`src/lib/content/links.ts`)

```ts
export interface CuratedLink {
  title: string;
  url: string;
  description?: string;
  category: string;
}

export const LINKS: CuratedLink[] = [
  // Musik
  { category: 'Musik', title: 'Tango DJ Network', url: 'https://...', description: '...' },
  // Lehrvideos
  { category: 'Lehrvideos', title: '...', url: '...' },
  // Community
  // Veranstaltungsportale
  // Organisationen
  // etc.
];

export const CATEGORIES = [...new Set(LINKS.map(l => l.category))];
```

> Actual links to be populated by the community/editor. Placeholders acceptable at initial implementation.

### Desktop Layout Structure

```
DesktopLayout
  main:
    heading "Links & Ressourcen"
    {#each CATEGORIES as category}
      <section id={category}>
        <h2>{category}</h2>
        [LinkCard] [LinkCard] [LinkCard]   ← lg:grid-cols-3
      </section>
    {/each}
  rightSidebar:
    <nav> category jump links (anchor links to sections)
    ─── divider ───
    "Link vorschlagen" mailto button
```

### LinkCard

- Title (as `<a href={url} target="_blank" rel="noopener noreferrer">`).
- Optional short description.
- Domain shown as small muted text.

### Mobile

Single-column list per section.

### No Load Function

Static data — no `+page.ts` needed. Route prerendered by default.

### Validation

```bash
npm run check && npm run build
```
