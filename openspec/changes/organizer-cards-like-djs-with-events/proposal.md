## Why

The OrganizerCard and VenueCard currently show basic information but lack the rich event preview that DJ cards have. Users want to quickly see upcoming events for each organizer/venue to discover what's happening next. This change aligns organizer/venue cards with the established DJ card pattern, providing a consistent browsing experience across all entity types.

## What Changes

- OrganizerCard will display the next 2 upcoming events with date, title, and location
- OrganizerCard layout will match DJ card styling (avatar, name with link, event previews)
- OrganizerCard will include a style/genre indicator similar to DJ style badges
- OrganizerCard "View Profile" button will appear at the bottom like DJ cards
- VenueCard layout adjustments to match the new card pattern (no avatar, cleaner structure)
- Both cards will show "Keine Termine" when no upcoming events exist

## Capabilities

### New Capabilities
- `organizer-event-preview`: Display upcoming events on organizer cards with date, title, and location links
- `venue-event-preview`: Display upcoming events on venue cards with event count and next event info

### Modified Capabilities
- `organizer-card-component`: Update the OrganizerCard component to follow DJ card UI pattern with event previews (requirement change)
- `venue-card-component`: Adjust VenueCard layout to match card pattern consistency (requirement change)

## Impact

- **Affected Components**: `src/lib/components/OrganizerCard.svelte`, `src/lib/components/VenueCard.svelte`
- **Affected Routes**: `/veranstalter` (organizer list), `/veranstalter/[slug]` (organizer detail), `/tanzraeume` (venues)
- **Data Requirements**: Organizers need `nextEvents` array (max 2) with title, date, city, and internal path/external URL
- **API Impact**: No API changes needed; data is already available from existing tribe events
- **Deployment**: Static compatible; prerendering works as events are embedded in page data