# Desktop Ankündigungen Spec

## Capability: `desktop-ankuendigungen`

### Summary

New `/ankuendigungen` route showing WP posts from the "Ankündigungen" category. Desktop: featured top post + list, archive sidebar. Mobile: single-column list.

---

## ADDED Requirements

### New Route: `/ankuendigungen`

#### Scenario: Load announcements page
- User navigates to `/ankuendigungen`
- Page fetches WP posts filtered by "Ankündigungen" category
- Featured announcement (first post) displayed prominently on desktop with large card
- Remaining posts listed below in single column
- Desktop right sidebar shows archive navigation grouped by month/year
- Mobile displays single-column list without sidebar
- Loading state shows skeleton cards
- Empty state displays "Keine Ankündigungen vorhanden"
- API error state displays "Ankündigungen konnten nicht geladen werden"

#### Scenario: Archive navigation on desktop
- Right sidebar displays announcements grouped by month: "Mai 2025 (3)", "April 2025 (2)"
- Clicking a month filters/scrolls to that month's posts
- Total announcement count displayed at bottom

### Files Added
- `src/routes/ankuendigungen/+page.ts` (load function)
- `src/routes/ankuendigungen/+page.svelte` (page component)

## MODIFIED Requirements

### API Module Enhancement

#### Scenario: Fetch announcements
- Function `fetchAnnouncements()` added to `src/lib/api/posts.ts`
- Fetches WP posts filtered by "Ankündigungen" category
- Supports configurable `perPage` parameter (default 20)
- Returns `BlogPost[]` type
- Returns empty array on API error

### Files Modified
- `src/lib/api/posts.ts` (add `fetchAnnouncements` function)

---

### Behaviour

#### Featured Announcement (desktop main)

- First post shown as a large feature card (full width of main column): image, date, title, excerpt, "Lesen →" link.

#### Announcement List

- Remaining posts as compact list items: date, title, "Lesen →" link (opens external WP site).

#### Right Sidebar (desktop)

- Archive grouped by month: "Mai 2025 (3)", "April 2025 (2)", etc.
- Clicking a month scrolls/filters to that month's posts.
- Total count at bottom.

#### Mobile

No right sidebar; all posts as simple list.

---

### States

| State | Behaviour |
|---|---|
| Loading | Skeleton cards |
| Empty | "Keine Ankündigungen vorhanden" |
| API error | "Ankündigungen konnten nicht geladen werden" |
