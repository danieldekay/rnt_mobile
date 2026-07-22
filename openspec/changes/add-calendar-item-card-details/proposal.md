# Proposal: add-calendar-item-card-details

## Why

The current event card is easy to scan for date, place, and price, but it still hides event-specific cues that matter when deciding whether to tap through. Users should be able to spot extras such as live music or show highlights directly in the card on both the home list and the calendar day list.

## What Changes

- Extend event cards to surface more event-specific detail when the feed exposes it, with examples such as live music and show highlights.
- Keep the existing logistics-first hierarchy, but reserve a compact secondary area for optional detail markers so the card remains fast to scan on mobile.
- Apply the richer card presentation consistently wherever `EventCard` is used today, especially the home page list and the selected-date event list on the calendar page.
- Preserve current fallback behavior when the API does not provide the relevant category or metadata signals.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `components`: expand `EventCard` requirements so reusable event cards can show supplemental event-detail markers when matching feed data is present.
- `home-event-browsing`: update home list browsing requirements so richer event-card details are visible without reducing mobile scannability.
- `calendar-browsing`: update selected-date browsing requirements so calendar event cards expose the same supplemental details as the home list.

## Impact

- Affected views: `/` home event list and `/kalender` selected-date event list.
- Affected code: `src/lib/components/EventCard.svelte`, supporting event-presentation utilities and constants, and any tests covering shared card rendering.
- API/data shape: no new endpoint is required; the change depends on category slugs or existing event metadata already present in the WordPress events feed. If live-music or show indicators are not present for an event, the added markers stay hidden.
- Deployment/prerender: no adapter-static or Cloudflare Pages behavior changes are expected because this is a presentation-layer enhancement on already fetched event data.
