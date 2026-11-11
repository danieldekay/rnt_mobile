# RNT Mobile 1.0 TangoAtlas client

## ADDED Requirements

### Requirement: Public event and occurrence discovery
RNT Mobile SHALL render eligible Rhein-Neckar event occurrences through TangoAtlas's generic scoped API in its existing browse, filter, calendar, map and detail views without duplicating the event database.

#### Scenario: Recurring calendar
- **GIVEN** a published weekly milonga and monthly second/fifth Saturday and last Tuesday rules with a cancelled and a rescheduled occurrence
- **WHEN** a visitor selects a bounded date window
- **THEN** only applicable occurrences appear once, with correct local time, stable IDs and venue/organizer/DJ links.

#### Scenario: Provider isolation
- **GIVEN** the app is configured for the TangoAtlas adapter
- **WHEN** list, calendar, detail and entity links load
- **THEN** they use the documented TangoAtlas contract, without requests to the WordPress Tribe API; current production configuration stays unchanged until cutover approval.

#### Scenario: Offline or partial data
- **GIVEN** the API is unreachable or results are incomplete
- **WHEN** the app displays cached or fallback data
- **THEN** source/freshness/coverage is marked, public data remains useful, and no user-specific response enters public caches.

### Requirement: Easy organizer event creation
RNT Mobile SHALL let an authenticated organizer submit a new event in a short accessible German-language UI using a source URL when available or a manual field entry fallback, with TangoAtlas managing the canonical proposal and moderation.

#### Scenario: URL has no structured metadata
- **GIVEN** an organizer pastes an ordinary unstructured page
- **WHEN** TangoAtlas cannot extract all required fields
- **THEN** the user can supply missing fields in the manual form, review and submit without the app manufacturing facts or requiring website changes.

#### Scenario: New one-off event
- **GIVEN** a verified organizer enters title, date/time, place and organizer
- **WHEN** the submission completes
- **THEN** the UI reports the real TangoAtlas draft/pending/published status and stores no duplicate local event record.

### Requirement: Authentik sign-in and TangoAtlas permissions
RNT Mobile SHALL use #56's secure Authentik Worker session while TangoAtlas independently checks event-specific permissions for create, edit and approval.

#### Scenario: Authorized event edit
- **GIVEN** organizer A has permission to manage an event
- **WHEN** they change its start time and submit with a fresh revision token
- **THEN** TangoAtlas accepts or queues a change against the existing event and the UI shows which state is actually public.

#### Scenario: Unauthorized actor
- **GIVEN** organizer B lacks event edit rights or the caller only has a portal read key
- **WHEN** an edit is attempted
- **THEN** the server rejects it and the client does not display a successful publication.

#### Scenario: Stale form or expired session
- **GIVEN** an expired login or superseded event revision
- **WHEN** the organizer submits
- **THEN** the form preserves entered work and explains sign-in/reconciliation without blind repeated writes.

### Requirement: Recurrence creation and exception editing for release 1.0
RNT Mobile 1.0 SHALL expose accessible recurring schedule and exception controls mapped to TangoAtlas #389, without a separate browser recurrence parser.

#### Scenario: Fifth Saturday
- **GIVEN** a new event is configured as every fifth Saturday
- **WHEN** it is approved
- **THEN** the calendar contains occurrences only in months with a fifth Saturday.

#### Scenario: Wednesday exception
- **GIVEN** the owner changes one Wednesday milonga to Thursday and cancels a later date
- **WHEN** both proposals are approved
- **THEN** the calendar shows only the rescheduled instance and the correct cancellation, with stable identity.

### Requirement: Verified 1.0 release
RNT Mobile SHALL NOT switch away from WordPress in production or claim 1.0 until a recorded current/future event coverage check, user submission/edit acceptance and deploy/rollback gates pass.

#### Scenario: Safe cutover
- **GIVEN** the API integration is locally functional but active upcoming legacy events or recurring exceptions are missing
- **WHEN** release readiness is assessed
- **THEN** 1.0 is blocked with an explicit coverage gap; the production source remains unchanged.
