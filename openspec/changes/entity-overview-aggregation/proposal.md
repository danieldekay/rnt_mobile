# Proposal: Compact Entity Overview Aggregation

## Why

DJ, organizer, and venue hub pages currently fetch complete Tribe event records and each page independently reconstructs counts, next events, and associations. Even with bounded date windows, this wastes payload and repeats upstream pagination.

## What changes

Add one shared Worker endpoint, `/api/entity-overview`, covering the current calendar month plus the following two months. The Worker:

- fetches the bounded Tribe event range with a maximum of 10 pages
- fetches remaining pages with bounded concurrency after page 1
- projects each source event to only the fields required for entity-list aggregation
- returns explicit coverage metadata including source page counts and truncation
- edge-caches the projected response for five minutes

DJ, organizer, and venue list routes consume this common compact feed. Detail routes retain their existing full event fetches.

## Outcome

The three entity hubs share the same cacheable event projection rather than downloading separate full event payloads. The existing "Nächste 3 Monate" filter becomes complete for the covered three-calendar-month range.
