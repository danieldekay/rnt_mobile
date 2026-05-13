## Design

### Affected Files

| File | Change type | Notes |
|---|---|---|
| `src/routes/djs/+page.ts` | **New** | Load function |
| `src/routes/djs/+page.svelte` | **New** | DJs page |
| `src/lib/api/tribe.ts` | Edit | Add `fetchOrganizers` if missing |
| `src/lib/types.ts` | Edit | Confirm/add `TribeOrganizer` type |

### API Function

```ts
// src/lib/api/tribe.ts
export async function fetchOrganizers(): Promise<TribeOrganizer[]> {
  const res = await fetch(`${TRIBE_BASE}/organizers?per_page=100`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.organizers ?? [];
}
```

> **Note**: DJs vs Veranstalter distinction may not exist in the Tribe API. Strategy: fetch all organizers, then in `+page.ts` attempt to filter by a "DJ" label in the organizer name or a custom field. If not feasible, the DJs page shows all organizers and is renamed/redirected to `veranstalter`. Confirm during implementation.

### Desktop Layout Structure

```
DesktopLayout
  main:
    heading "DJs"
    [DjCard] [DjCard] [DjCard]   ← lg:grid-cols-3
  rightSidebar:
    style filter chips (Traditionell, Neo, 50/50)
    ─── divider ───
    count
```

### DjCard

- Organizer photo (placeholder avatar if none).
- Name.
- "Veranstaltungen" link showing their events on the main events page filtered by organizer.

### Validation

```bash
npm run check && npm run build
```
