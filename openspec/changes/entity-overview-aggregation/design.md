# Design: Compact Entity Overview Aggregation

## Worker data path

```
Tribe Events API
     ↓ page 1
bounded page count + total_pages
     ↓ pages 2..N in batches of 4
compact projection
     ↓
Cloudflare Cache API (5 min)
     ↓
/api/entity-overview
```

The shared bounded fetcher has:
- maxPages default 10
- concurrency default 4, clamped to 1..8
- per-request timeout
- stable source order because each Promise.all batch preserves page order

## Projection

Retain only fields required by current hub aggregators: event identity/title/URL, description/excerpt for DJ attribution, image, start/end, category identifiers/slugs, venue identity/name/city, and organizer identity/name.

The client inflates this compact representation into a minimal `TribeEvent` shape so existing, tested organizer/venue/DJ aggregation utilities remain unchanged.

## Coverage semantics

The endpoint returns `range_start`, `range_end`, `pages_fetched`, `total_pages`, and `truncated`. Hub pages expose a visible warning if the source exceeded the 10-page budget. Counts are therefore never silently presented as complete after truncation.

## Cache policy

The endpoint is cacheable by both the Worker edge cache and the existing Service Worker public-GET policy. Auth/mutation caching rules are unchanged.
