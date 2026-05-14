## 1. Type Definitions

- [x] 1.1 Add `nextEvents: OrganizerNextEventSummary[]` field to `OrganizerWithStats` in `src/lib/types.ts`
- [x] 1.2 Add `OrganizerNextEventSummary` interface mirroring `DjNextEventSummary`
- [x] 1.3 Add `nextEvent` and `upcomingCount` fields to `EnhancedVenue` for venue event preview

## 2. Data Transformation

- [x] 2.1 Create `getNextEventsForOrganizer()` helper in `src/lib/utils/date-filters.ts`
- [x] 2.2 Update `veranstalter/+page.ts` to include next events data from existing events
- [x] 2.3 Update `veranstalter/[slug]/+page.ts` to include next events for detail view

## 3. OrganizerCard Component

- [x] 3.1 Update OrganizerCard to accept `nextEvents` prop
- [x] 3.2 Add event preview section with calendar icon, title link, and date/city
- [x] 3.3 Add "Keine Termine" empty state message
- [x] 3.4 Style event previews to match DJ card pattern
- [x] 3.5 Update route pages to pass event data to OrganizerCard

## 4. VenueCard Component

- [x] 4.1 Add event preview section with next event info
- [x] 4.2 Add upcoming event count badge
- [x] 4.3 Add "Kein Termin geplant" empty state
- [x] 4.4 Remove avatar/placeholder from VenueCard

## 5. Validation

- [x] 5.1 Run `npm run check` to verify TypeScript correctness
- [x] 5.2 Run `npm run build` to verify static build compatibility
- [x] 5.3 Test on dev server to verify visual appearance