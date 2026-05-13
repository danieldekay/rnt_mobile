## Design

### Affected Files

| File | Change type | Notes |
|---|---|---|
| `src/routes/tanzraeume/+page.ts` | **New** | Load function |
| `src/routes/tanzraeume/+page.svelte` | **New** | Venues page |
| `src/lib/api/tribe.ts` | Edit | Add `fetchVenues` |
| `src/lib/types.ts` | Edit | Confirm/add `TribeVenue` type |

### API Function

```ts
// src/lib/api/tribe.ts
export async function fetchVenues(): Promise<TribeVenue[]> {
  const res = await fetch(`${TRIBE_BASE}/venues?per_page=100`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.venues ?? [];
}
```

### Desktop Layout Structure

```
DesktopLayout
  main:
    heading "Tanzräume"
    [VenueCard] [VenueCard]   ← lg:grid-cols-2
  rightSidebar:
    city filter chips (derived from venue.city)
    ─── divider ───
    count
```

### VenueCard

- Venue name.
- Address (street, city).
- Google Maps link (if lat/lon available from Tribe API).
- Upcoming event count link.

### Mobile

Single-column list.

### Validation

```bash
npm run check && npm run build
```
