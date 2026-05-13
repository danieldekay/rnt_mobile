## Design

### Overview

Update `src/routes/event/[slug]/+page.svelte` to show event description + image in main column and event metadata in a sticky right sidebar on desktop.

### Affected Files

| File | Change type | Notes |
|---|---|---|
| `src/routes/event/[slug]/+page.svelte` | Edit | Add right-sidebar metadata panel |

### Desktop Layout Structure

```
DesktopLayout
  main:
    EventHero (image, title, event-type badge, music-type badge)
    EventDescription (sanitised HTML, DOMPurify)
  rightSidebar:
    Date / time (formatted)
    Venue name → /tanzraeume/[slug] link (future) or external map link
    Organiser name → /veranstalter/[slug] link
    Registration / ticket CTA button (teal primary, full-width)
    ─── divider ───
    Event-type badge
    Music-type badge
```

### Sticky Panel

Right sidebar: `position: sticky; top: 1.5rem`.

### Mobile

No change — existing vertical layout: image → badges → description → metadata.

### Design Token Usage

- CTA button: `--action-primary` background.
- Metadata labels: `--text-muted`.
- Divider: `--border-default`.

### Validation

```bash
npm run check
npm run build
```
