## 1. Type Definitions

- [ ] 1.1 Add `nextEvents: OrganizerNextEventSummary[]` field to `OrganizerWithStats` in `src/lib/types.ts`
- [ ] 1.2 Add `OrganizerNextEventSummary` interface mirroring `DjNextEventSummary`
- [ ] 1.3 Add `nextEvent` and `upcomingCount` fields to `EnhancedVenue` for venue event preview

## 2. Data Transformation

- [ ] 2.1 Create `getNextEventsForOrganizer()` helper in `src/lib/utils/date-filters.ts`
- [ ] 2.2 Update `veranstalter/+page.ts` to include next events data from existing events
- [ ] 2.3 Update `veranstalter/[slug]/+page.ts` to include next events for detail view

## 3. OrganizerCard Component

- [ ] 3.1 Update OrganizerCard to accept `nextEvents` prop
- [ ] 3.2 Add event preview section with calendar icon, title link, and date/city
- [ ] 3.3 Add "Keine Termine" empty state message
- [ ] 3.4 Style event previews to match DJ card pattern
- [ ] 3.5 Update route pages to pass event data to OrganizerCard

## 4. VenueCard Component

- [ ] 4.1 Add event preview section with next event info
- [ ] 4.2 Add upcoming event count badge
- [ ] 4.3 Add "Kein Termin geplant" empty state
- [ ] 4.4 Remove avatar/placeholder from VenueCard

## 5. Validation

- [ ] 5.1 Run `npm run check` to verify TypeScript correctness
- [ ] 5.2 Run `npm run build` to verify static build compatibility
- [ ] 5.3 Test on dev server to verify visual appearance