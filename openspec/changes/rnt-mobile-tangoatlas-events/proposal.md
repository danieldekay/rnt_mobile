# Proposal: TangoAtlas-backed RNT Mobile events and editing

Issue: https://github.com/danieldekay/rnt_mobile/issues/117

## Outcome
Retain the working static SvelteKit PWA's list/calendar/detail UX while replacing its WordPress Tribe Events data source with the generic TangoAtlas regional event occurrence API. Subsequently, an Authentik-signed-in organizer can propose/edit an event they own through TangoAtlas's permission-checked write interface.

## Baseline
- `src/lib/api/tribe.ts` fetches the WordPress Events API; `src/lib/stores/events.svelte.ts` and existing routes consume its data.
- `worker.ts` serves Cloudflare Worker Assets; authenticated Worker/OIDC design already exists as #56.
- TangoAtlas #531 owns the read API proof, #532 owns event edit authorization, #389 occurrences, #376 public API, #377 portal scope.
- Hermes Scout #20 owns source discovery, not ingestion and not editing.

## Phases
1. Read-only test adapter pointing to TangoAtlas; preserve current display, search, calendar, map, offline/error behavior; no prod cutover.
2. Authentik Worker session + TangoAtlas user authorization contract and one organizer edit/proposal form; preserve moderation and conflict feedback.
3. Separate verified deployment/migration gate; WordPress remains until explicitly approved.

## Deliberate non-goals
No new RNT backend/database, no WordPress editing integration, no TangoAtlas event schema owned by mobile, no changes in TMD Mobile, no broad entity-management UI, no automatic cutover.

## Reconciliation preflight
Read AGENTS.md, `openspec/config.yaml`, current source/tests/issues/PRs/planning branches. Reuse #56 sign-in and #106 organizer UX, and avoid implementing endpoints before TangoAtlas's agreed API specs. A planning branch is not a deploy authorization.
