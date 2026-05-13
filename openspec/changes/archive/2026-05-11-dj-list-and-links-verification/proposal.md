# Proposal: DJ List Display Verification, DJ Single View, Links with Events, and Parsing of DJs from Events

## Why

The DJ feature was built incrementally across two prior changes (`fix-entity-page-load-timeout` and `worker-cdn-cache`) and the DJ CPT integration. During implementation, several gaps and inconsistencies were identified that need to be resolved:

1. **DJ list display verification**: The DJ list page (`/djs`) uses `getDjsFromCptAndEvents()` which seeds all 16 CPT DJs with zeroed stats, then enriches with event data. However, the `getDjsFromCptAndEvents()` function has a subtle bug: it uses `getDjSlug(cptDj.name)` as the map key for CPT DJs, but then sets `slug: cptDj.slug` (the WordPress slug). When events are parsed, they use `getDjSlug(normalizedName)` as the key — which may differ from the CPT slug. This means a CPT DJ and an event-parsed DJ with the same name but different slug representations could end up as separate entries. Need to verify and fix this matching logic.

2. **DJ single view (`/djs/[slug]`)**: The single view page currently shows a basic profile with name, style, upcoming count, and a list of events. It lacks:
   - A proper bio/description section (could be derived from event descriptions or from CPT meta if available)
   - City information (where the DJ is based, from CPT `rnt_stadt` or derived from events)
   - Style breakdown with visual indicators
   - A link back to the event detail page from each event card (already handled by `EventCard`)

3. **Links with events**: The event detail page (`/event/[id]`) shows a DJ link in the sidebar using `getDjSlug(dj)` to build the URL. However, this computed slug may not match the actual CPT slug stored in the DJ profile. When a user clicks the DJ link from an event, they might get a 404 if the slug doesn't match any CPT DJ slug. The link should use the CPT slug when available, falling back to the computed slug.

4. **Parsing of DJs from events**: The `extractDjFromDescription()` function in `tribe.ts` uses regex patterns to find DJ names in event descriptions. This works for the common case but misses:
   - DJs mentioned in the excerpt (short description) rather than the full description
   - DJs listed in event titles (e.g., "Milonga mit DJ Leilani")
   - Multiple DJs per event (currently only extracts the first match)
   - DJs listed in the organizer field when the organizer is actually a DJ

## What Changes

### 1. Fix DJ CPT-to-event matching in `getDjsFromCptAndEvents()`

**`src/lib/utils/djs.ts`** — `getDjsFromCptAndEvents()`:
- Change the map key from `getDjSlug(cptDj.name)` to `cptDj.slug` (the WordPress slug)
- When enriching from events, compute `getDjSlug(normalizedName)` and then look up the CPT DJ by matching against `cptDj.slug` or `getDjSlug(cptDj.name)`
- Add a fallback: if an event-parsed DJ doesn't match any CPT DJ, create a new entry (as currently done)
- This ensures CPT DJs with their canonical slugs are always matched correctly

### 2. Enhance DJ single view (`/djs/[slug]`)

**`src/lib/utils/djs.ts`** — `getDjProfileBySlug()`:
- Add `city` field to the returned profile, derived from the most common city in the DJ's events
- Add `bio` field, derived from concatenating unique event descriptions (truncated)

**`src/routes/djs/[slug]/+page.svelte`**:
- Add city badge to the profile header (when available)
- Add bio section showing derived description
- Add style breakdown with visual bars/chips
- Add "Nächster Termin" quick-link card below the profile

### 3. Fix DJ link resolution from event detail page

**`src/routes/event/[id]/+page.svelte`**:
- Change `djProfileLink` derivation to use a lookup approach: instead of computing `getDjSlug(dj)`, pass the DJ name through a function that checks against known CPT DJs
- Add a new derived store or utility that maps DJ names → CPT slugs for accurate link resolution

**`src/lib/utils/djs.ts`**:
- Add `getDjCptSlugByName(name: string, cptDjs: DjCptEntry[]): string | null` utility function
- This function looks up a DJ name in the CPT list by normalized comparison and returns the canonical CPT slug

**`src/routes/event/[id]/+page.ts`**:
- Add `fetchDjCptList(fetch)` call in parallel with `fetchEventById`
- Pass `cptDjs` to the page data so the Svelte component can resolve accurate DJ links

### 4. Improve DJ parsing from events

**`src/lib/api/tribe.ts`** — `extractDjFromDescription()`:
- Add additional regex patterns:
  - Match DJ in event title: check `event.title` for "DJ" or "Dj" prefix patterns
  - Match DJ in excerpt: apply same regex to `stripHtmlToPlainText(event.excerpt)`
  - Match multiple DJs separated by "&", "und", "," — return the first one found (keep single return for backward compatibility)
- Add `extractAllDjsFromEvent(event: TribeEvent): string[]` for internal use by the profile builder

**`src/lib/utils/djs.ts`** — `getDjsFromCptAndEvents()`:
- Use `extractAllDjsFromEvent()` internally to capture all DJs mentioned in an event
- This ensures DJs mentioned in titles or excerpts are also captured

### 5. DJ list page display refinements

**`src/routes/djs/+page.svelte`**:
- Add city information to each DJ card (derived from `nextEventCity`)
- Show "Keine Termine" badge more prominently for DJs with zero upcoming events
- Add a subtle visual distinction between CPT-seeded DJs (with canonical data) and event-only DJs

## Capabilities

### Modified Capabilities

- `entity-dj-list`: DJ list page now correctly matches CPT DJs with event data, shows city info, and distinguishes between CPT-seeded and event-only DJs.
- `entity-dj-detail`: DJ detail page now shows city, bio, style breakdown, and has accurate links.
- `event-detail`: Event detail page now links to correct DJ profile slugs using CPT data.
- `entity-dj-parsing`: DJ extraction from events now covers titles, excerpts, and multiple DJs per event.

## Impact

- **Files changed**:
  - `src/lib/api/tribe.ts` — enhanced `extractDjFromDescription()`, new `extractAllDjsFromEvent()`
  - `src/lib/utils/djs.ts` — fixed matching logic, added `getDjCptSlugByName()`, enhanced profile data
  - `src/lib/types.ts` — may need additional fields for enhanced profile data
  - `src/routes/djs/+page.svelte` — city info, visual refinements
  - `src/routes/djs/[slug]/+page.svelte` — bio, city, style breakdown
  - `src/routes/djs/[slug]/+page.ts` — may pass additional data
  - `src/routes/event/[id]/+page.ts` — fetch CPT DJs for link resolution
  - `src/routes/event/[id]/+page.svelte` — use CPT slug for DJ link

- **User-visible effect**:
  - All 16 CPT DJs now correctly show on the DJ list with their canonical slugs
  - Clicking a DJ name from an event detail page always resolves to the correct profile
  - DJ profiles show richer information (city, bio, style breakdown)
  - DJs mentioned in event titles or excerpts are now captured
  - No more 404 errors when following DJ links from events

- **Performance impact**: Minimal — the CPT DJ list is fetched once (16 items, single request) and cached for 30 minutes at the CDN edge.

- **Prerendering**: No changes — all affected routes remain `prerender = false`.

- **API / feed impact**: Adds one additional API call (`/api/dj-cpt`) to the event detail page load, but this is a single small request that is CDN-cached.