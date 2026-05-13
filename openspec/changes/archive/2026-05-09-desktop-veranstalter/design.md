## Design

### Affected Files

| File | Change type | Notes |
|---|---|---|
| `src/routes/veranstalter/+page.ts` | **New** | Load function |
| `src/routes/veranstalter/+page.svelte` | **New** | Veranstalter page |
| `src/lib/api/tribe.ts` | Edit | `fetchOrganizers` (shared with `desktop-djs`) |
| `src/lib/types.ts` | Edit | Confirm `TribeOrganizer` type |

### Desktop Layout Structure

```
DesktopLayout
  main:
    heading "Veranstalter"
    [OrgCard] [OrgCard]   ← lg:grid-cols-2
  rightSidebar:
    city/region filter chips
    ─── divider ───
    count
```

### OrgCard

- Organizer photo/logo (placeholder if none).
- Name.
- Website link (if available).
- "Veranstaltungen" count link.

### Mobile

Single-column list of organiser cards.

### Shared API Function

`fetchOrganizers()` from `src/lib/api/tribe.ts` — shared with `desktop-djs`. Implement once, reuse here.

### Validation

```bash
npm run check && npm run build
```
