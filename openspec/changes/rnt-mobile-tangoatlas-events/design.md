# Design notes

## Source and presentation boundary
- TangoAtlas owns event identities, occurrence identities, relationships, source freshness, moderation and user permissions.
- RNT Mobile uses a typed API adapter whose output matches existing view/store contracts; keep source-specific conversion isolated.
- Query bounded date ranges and regional portal scope; never download and re-filter the whole global registry client-side.
- Keep parent recurring events and individual occurrence IDs distinct; pass explicit IANA timezone and ISO timestamps.
- Preserve current UI hierarchy in list/calendar/details. Test and handle cancellations/reschedules and recurring exceptions.

## Identity and writes
- Reuse Authentik OIDC via Cloudflare Worker (issue #56); no WordPress role mapping for TangoAtlas editing.
- Public portal-scope API keys authenticate a read consumer, **not** an organizer.
- A user edit is authorized by TangoAtlas's per-event policy (backend #532), not by RNT Mobile UI.
- Reuse worker secure session/cookie and an explicit token exchange/BFF contract where needed; don't expose server secrets or refresh tokens to browser storage or shared caches.
- Edit/create proposal should use current canonical ID + revision token, show pending/accepted state, and handle 400/401/403/409/5xx plus retries. Never trust a client-supplied owner ID.
- First local proof is an organizer changing their own event's date/time and optionally venue, with a second organizer denied. Recurrence edits wait for accepted #389 semantics.

## Cutover
Build time/local development flag for new provider; production uses WordPress until explicit acceptance with data parity, pagination, SEO/event URLs, caching and rollback checks. Do not treat merge as deployment.
