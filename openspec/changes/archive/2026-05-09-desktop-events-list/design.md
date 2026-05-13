## Design

### Overview

Update `src/routes/+page.svelte` only. The page threads a `rightSidebar` snippet into `DesktopLayout` containing the filter controls and summary stats. On desktop, event cards render in a two-column grid.

### Affected Files

| File | Change type | Notes |
|---|---|---|
| `src/routes/+page.svelte` | Edit | Add desktop grid + right-sidebar filter panel |

### Desktop Layout Structure

```
DesktopLayout
  main:
    heading "Veranstaltungen"
    [EventCard] [EventCard]     ← lg:grid-cols-2
    [EventCard] [EventCard]
  rightSidebar:
    DateFilter (date range picker)
    FilterChip row (event types)
    MusicFilterChip row
    ─── divider ───
    count: "12 Veranstaltungen"
    next-month summary chip
```

### Mobile Layout (unchanged)

Existing vertical list, inline filter chips, `DateFilter` above cards.

### Card Grid

- Mobile (< 1024 px): existing single-column list.
- Desktop (≥ 1024 px): `grid grid-cols-2 gap-4` wrapping all `EventCard` components.
- `EventCard` component itself is unchanged.

### Right Sidebar Content

```svelte
{#snippet rightSidebar()}
  <div class="space-y-4">
    <DateFilter ... />
    <div class="flex flex-wrap gap-2">
      {#each eventTypes as type}
        <FilterChip ... />
      {/each}
    </div>
    <div class="flex flex-wrap gap-2">
      {#each musicTypes as type}
        <MusicFilterChip ... />
      {/each}
    </div>
    <hr class="border-border-default" />
    <p class="text-text-muted text-sm">{filteredEvents.length} Veranstaltungen</p>
  </div>
{/snippet}
```

### Design Token Usage

All existing tokens — no additions needed for this change.

### Validation

```bash
npm run check
npm run build
```
