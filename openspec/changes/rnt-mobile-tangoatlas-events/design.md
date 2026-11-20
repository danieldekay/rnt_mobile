# Design: TangoAtlas API adapter and safe organizer flows

## Architecture

```text
RNT Mobile Svelte 5 static PWA (existing UI/store)
     | public event queries                 | organizer create/edit
     v                                      v
Cloudflare Worker (portal API key secret)   Cloudflare Worker Authentik OIDC session
     |                                      | validated user trust contract
     +----------------------+---------------+
                            v
        TangoAtlas generic /api/v1/ event queries + owned submissions
             event + occurrence + venue/organizer/DJ relations
                            v
           Existing TangoAtlas moderation/public projection
```

The diagram describes responsibilities, not assumed existing route paths. Audit actual endpoints before implementation. Avoid a proxy if the validated contract allows safe direct public reads **without exposing scope keys**; otherwise Worker holds portal credentials server-side.

## Read adapter
- Preserve `src/lib/api/tribe.ts` as legacy only during rollout; add a single, typed TangoAtlas source adapter at `src/lib/api/`, adapt through `src/lib/stores/events.svelte.ts`, and maintain existing route types.
- Select the provider per environment/test, not by retrying a 401 against WordPress. Production keeps current provider until approved.
- Query bounded date windows through portal scope; don't fetch the entire TangoAtlas registry. Event vs occurrence ID and original scheduled identity are distinct.
- Return timezone-aware ISO times; handle last Tuesday, second/fifth Saturday and weekly recurring exceptions according to #389 read API. Do not calculate complex recurrence independently in browser.
- Map venue/organizer/DJ canonical references, cancellation and reschedule, canonical/source URLs, pagination and freshness. Use existing map/calendar/list detail and safe external links.
- Offline PWA snapshots remain public/read-only; caches must be keyed by provider/version. No authentication, write payload or other user's data in cache.

## Authentication / authorization
- Reuse [RNT Mobile #56](https://github.com/danieldekay/rnt_mobile/issues/56): Worker-based Authentik OIDC Authorization Code + PKCE with secure HttpOnly SameSite session.
- Authentik authenticates the user. **TangoAtlas** maps the user to its account and decides event-specific create/edit/approve rights. Worker may transport secure credentials but cannot decide ownership.
- Public portal API keys are not user credentials. Do not put secrets in static JavaScript, localStorage, or service worker.
- UI should show `Bearbeiten` only for granted capabilities from server; server MUST reject unauthorized writes even if a user manually calls the API.

## Minimum German-language organizer UX
- From header/appropriate organizer area, show `Veranstaltung hinzufügen` and one small guided form: paste event URL OR choose manual entry; title, date/time, venue/location, organizer, type, source URL as appropriate. Prefill only evidenced fields from TangoAtlas suggestion API where available and allow corrections.
- Submit as proposal. Show `Eingereicht`, `Wartet auf Prüfung`, or `Veröffentlicht` based on actual backend state; no false success when network is unknown. Retain form state during validation/offline/expired session.
- An authorized organizer can edit their existing event: update title, schedule, venue and text; compare revisions, review, submit, see moderation state. Unsupported relations/unknown IDs cannot be fabricated.
- Recurrence editor for 1.0 reuses server RRULE model #389 with accessible controls: weekly weekday, monthly n-th/last weekday, optional end, excluded dates, cancel/reschedule individual occurrence. Do not show raw RRULE as default UI.
- Keep primary public discovery anonymous, fast and unaffected. Text/responsive UX in German, keyboard/screen-reader accessible.

## API errors
- 400 field validation linked to form controls; 401 session expired (re-login, preserve input); 403 unauthorized; 409 stale revision/conflict with compare/retry; 429 temporary delay; 5xx/timeout unknown write state with read-back reconciliation; no blind duplicate submit.
- Show loading, empty, offline and stale coverage notices. Do not silently merge WordPress and TangoAtlas events.

## Release acceptance / migration
- Prove current/future event coverage, active recurring series, known cancellations and venue/organizer/DJ relationships from WordPress/Tribe against TangoAtlas; record old IDs and canonical links and bounded exceptions.
- Test 1.0 locally: anonymous calendar, organizer A add/edit and recurrence exception, organizer B denied, moderator approval, PWA offline/expired session, zero privileged browser/cache leaks.
- Separate browser acceptance, staging smoke, legacy link/SEO redirect and rollback tests. Only then obtain explicit production cutover approval. Merged PR != deployment.
