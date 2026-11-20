# Proposal: RNT Mobile 1.0 — TangoAtlas-backed calendar and organizer self-service

**Release owner:** [RNT Mobile #117](https://github.com/danieldekay/rnt_mobile/issues/117)
**Backend read:** [TangoAtlas #531](https://github.com/danieldekay/tangoatlas/issues/531)
**Backend write:** [TangoAtlas #532](https://github.com/danieldekay/tangoatlas/issues/532)
**Source scouting (independent):** [Hermes #20](https://github.com/danieldekay/hermes-custom-scripts/issues/20)

## Why
The working Svelte 5/static Cloudflare PWA depends on WordPress/The Events Calendar as its event source. Organizers must duplicate entry on multiple websites and the paid plugin is undesirable. TangoAtlas's generic event, recurrence, relationship, ingestion, moderation and permission contracts should replace this backend, **not** trigger another RNT CMS.

## User-visible 1.0 outcome
A visitor can browse Rhein-Neckar events, recurring milongas and venues/DJs from TangoAtlas. A non-technical organizer can sign in once with Authentik, **add an event** by pasting its source URL (when supported) or entering a few fields, and **edit an event they manage**. TangoAtlas's own permissions and moderation decide whether a change is accepted or pending. WordPress event source is retired from the Mobile production path **only after verified data coverage and a separately approved release**.

## Bounded delivery sequence
1. **A: Local read-only proof** — API adapter maps TangoAtlas generic events/occurrences into existing list/calendar/detail/filter/map/store. No production switch.
2. **B: Authenticated one-off create/edit proof** — reuse existing Worker Authentik/OIDC #56, TangoAtlas #532 and existing UX patterns; short German organizer form, manual fallback, clear moderation status. No WordPress roles.
3. **C: 1.0 recurrence and acceptance** — after #389, support recurring creation/editing and date exceptions; migrate/verify current and future calendar coverage, old links and rollback. Release only with explicit approval.

## Relationships and constraints
- **RNT Mobile:** interface, API adapter, Worker session, forms, local offline/presentation; no domain database, no permission authority, no AI ingestion.
- **TangoAtlas:** canonical data, events and occurrences, entity links, accepted revisions, moderation, event write API and per-record authorization; portal read keys cannot perform writes.
- **Hermes R&T Scout:** discovers regional original sources and forwards evidence; not a 1.0 release blocker.
- **TMD Mobile:** unrelated experiment; NO changes.

## Non-goals
No new RNT WordPress plugin, local event database, generic TangoAtlas admin frontend, complete historical migration, ticketing/RSVP, independent AI processor, broad autonomous scouting prerequisite, automatic deployment or paid-subscription cancellation.

## Preflight
Read AGENTS.md, openspec/config.yaml, existing code and pending OpenSpec/PRs/Beads, #56 and #106. Reconcile real current behavior, not stale docs. Use test-first bounded changes and one worktree per OpenSpec change. A planning branch is not implementation proof.

## Strategy alignment — 20 November 2026

The [cross-project maintenance-first risk policy](https://github.com/danieldekay/2ndBrain-projects/pull/6) prioritizes fewer human minutes maintaining correct local calendars. RNT Mobile 1.0 **does not depend on unattended Scout publication**: its acceptance is correct Atlas events and recurring occurrences (including overrides/cancellations), authorized organizer editing, pending/accepted/read-only states, data coverage and release verification. Deterministic occurrence generation is Atlas #389; rights/moderation are Atlas #532. Show source freshness/status where the API provides it, but don't create another permission/policy engine or generic review console in the mobile app. Scouted public-web cancellations and recurrence-rule changes remain proposals for Atlas adjudication.
