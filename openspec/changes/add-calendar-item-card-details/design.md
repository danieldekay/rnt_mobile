# Design: add-calendar-item-card-details

## Context

`EventCard` is the shared presentation component for the home event list and the selected-date list on `/kalender`. It already emphasizes date, title, venue, time, cost, organizer, DJ, and two primary badges derived from category slugs, but it does not expose additional event-specific markers that can help a user decide faster whether an event is worth opening.

The safest implementation path is a presentation-only enhancement on top of the existing event payload. The current app already derives event type and music type from category slugs in `src/lib/utils/event-presentation.ts`, so the same pattern can classify optional highlight markers such as live music or show when matching feed categories are present.

## Goals / Non-Goals

**Goals:**

- Add a compact, optional highlight area to `EventCard` for extra event-detail markers without disturbing the logistics-first layout.
- Keep card behavior consistent between the home page and calendar route by enhancing the shared component instead of route-local markup.
- Reuse existing category-driven presentation utilities so the change remains static-safe and does not require a new fetch shape.
- Add focused component tests for the richer card behavior and graceful fallback behavior.

**Non-Goals:**

- No change to route structure, navigation flow, or event filtering behavior.
- No new API endpoint, server-side enrichment, or CMS schema migration.
- No attempt to expose every possible event category in the card; the first pass only covers a small approved set of high-value markers.

## Decisions

### Decision: Derive supplemental card markers from existing category metadata

The implementation will extend the existing category-to-presentation mapping instead of adding ad hoc parsing inside `EventCard`.

Rationale:

- Category slug checks already exist in `src/lib/utils/event-presentation.ts` for event type and music type.
- Keeping classification logic outside the Svelte component makes the card easier to read and test.
- The UI can stay resilient: if the API omits a recognized slug, no marker is rendered.

Alternatives considered:

- Parse `event.description` or `event.excerpt` for keywords. Rejected because the signals are less reliable, more language-sensitive, and harder to test.
- Hardcode conditional markup directly in `EventCard`. Rejected because it would duplicate classification logic and make future marker additions messier.

### Decision: Use a single compact marker row beneath the core logistics block

Supplemental markers will render as a small wrap-capable row inside `EventCard`, visually secondary to title, place, and time.

Rationale:

- The current card already has a strong scan path; adding details into the main badge column would crowd the date block.
- A secondary row can collapse naturally when no extra markers are present.
- The same layout works in both the home list and calendar-selected-day list without route-specific branching.

Alternatives considered:

- Add more badges to the left date column. Rejected because the narrow column is already near its density limit on mobile.
- Replace organizer or DJ lines with highlight markers. Rejected because organizer and DJ remain more foundational to decision-making.

### Decision: Add focused component-level tests before implementation

The change will be validated with a new `EventCard` test file that covers recognized markers and hidden-marker fallback behavior.

Rationale:

- `EventCard` is a shared component, so a focused test gives better coverage than route-only checks.
- The helper classification can be validated through rendered output without coupling tests to internal implementation details.

## Risks / Trade-offs

- [Feed taxonomy mismatch] → Mitigation: keep the recognized highlight-slug list small and isolated in constants/utilities so mismatches are easy to adjust.
- [Card density regression on small screens] → Mitigation: render markers in a visually secondary wrap row and limit the initial marker set.
- [Inconsistent route behavior] → Mitigation: implement the feature only in `EventCard`, which is already shared by both affected routes.
- [Ambiguous scope from the request] → Mitigation: document the approved initial examples as live music and show, and keep additional markers as a follow-up once the feed taxonomy is confirmed.

## Open Questions

- Which exact WordPress category slugs should map to the first release of supplemental markers beyond the examples of live music and show?
