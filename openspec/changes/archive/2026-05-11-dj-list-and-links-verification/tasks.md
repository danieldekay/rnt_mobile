# Tasks: DJ List and Links Verification

## Status

- [x] 1. Fix DJ CPT-to-event matching in `getDjsFromCptAndEvents()` (already correct - seeded by CPT slug, enriched with CPT name lookup)
- [x] 2. Enhance DJ single view (`/djs/[slug]`) - derived bio from events, city badge, style breakdown
- [x] 3. Add `extractAllDjsFromEvent()` for multiple DJs, parse from title/excerpt/description
- [x] 4. Update event detail page DJ link to use CPT slug when available (already implemented with `getDjCptSlugByName` + fallback)
- [x] 5. Update DJ list page to show city and "Keine Termine" muted state