## Context

The Links & Ressourcen page (`/links`) currently displays curated community links in a table format. The current implementation has two issues:

1. **UI Inconsistency**: The table uses older styling patterns (e.g., manual `border-*` classes, basic `table` structure) that don't match the app's modern design language. Other components like `AgendaPanel.svelte` use a cleaner card-based layout with consistent spacing and typography.

2. **RSS Feed Not Working**: The code already has RSS fetching logic in `src/lib/api/links.ts`, but it falls back to static hardcoded data in `src/lib/content/links.ts`. The `fetchLinks()` function returns an empty array on failure, and the load function uses `apiLinks.length > 0` to decide fallback - but the RSS endpoint might not be returning data correctly.

## Goals / Non-Goals

**Goals:**
- Update table UI to match existing design patterns (card-based, consistent typography, proper spacing)
- Fix RSS feed data fetching to work correctly and display dynamic data
- Maintain mobile-first responsive behavior (table on desktop, card list on mobile)

**Non-Goals:**
- Add new link features (suggestion, voting, etc.) - these are future work
- Change the data schema or add new fields to the link objects
- Modify the static fallback data structure

## Decisions

### Decision 1: Table UI Approach
**Choice:** Refactor existing table to use card-based layout matching `AgendaPanel.svelte`

**Alternative Considered:**
- Keep table but improve styling with Tailwind utilities
- Card-based layouts are already established in the app and work better on mobile

**Rationale:** `AgendaPanel` already demonstrates the design pattern: `card` class, `space-y-*`, consistent typography using `meta-text`, `font-display`, etc. This creates visual consistency.

### Decision 2: RSS Feed Debugging
**Choice:** Add debugging/logging to understand why RSS fetch returns empty, then fix the parser or endpoint handling

**Alternative Considered:**
- Switch to a different API endpoint
- Keep static data as primary

**Rationale:** The RSS feed URL is already configured. The most likely issue is either:
- XML parsing edge cases (encoding, CDATA handling)
- Network/auth issues with the endpoint
- The endpoint returning empty/invalid XML

The fetch already has error handling but returns `[]` silently. Need to add console logging to diagnose.

### Decision 3: Fallback Behavior
**Choice:** Log when falling back to static data, but keep fallback for offline resilience

**Rationale:** Static fallback is valuable for PWA offline support. The change should make RSS work, not remove the fallback.

## Risks / Trade-offs

- **[Risk] RSS endpoint might be down or requires auth** → Mitigation: Add detailed logging to diagnose, keep static fallback as reliable fallback
- **[Risk] RSS data structure might not match expected schema** → Mitigation: The parser already handles CDATA and basic fields; adjust parser if needed after debugging
- **[Risk] Breaking change in table layout** → Mitigation: Keep same columns and data, just change visual presentation

## Open Questions

1. Does the RSS feed URL require specific query parameters or authentication?
2. Should we add a "Last updated" timestamp to show when data was fetched?
3. Should we add a "Refresh" button for manual re-fetching on the client side?