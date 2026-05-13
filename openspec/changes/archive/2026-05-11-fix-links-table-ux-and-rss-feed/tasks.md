## 1. RSS Feed Debugging and Fixing

- [x] 1.1 Test RSS feed endpoint manually - verify URL `https://www.rhein-neckar-tango.de/feed/linklibraryfeed?settingsset=1` returns valid XML
- [x] 1.2 Add detailed console logging in `fetchLinks()` to diagnose why empty array is returned
- [x] 1.3 Fix RSS parser edge cases if XML structure differs from expected (CDATA handling, encoding)
- [x] 1.4 Verify parser correctly extracts title, link, description, and category from each item
- [x] 1.5 Test category extraction produces correct unique list

## 2. UI Updates for Links Table

- [x] 2.1 Update table container to use `card`, `rounded-card`, `shadow-card` classes
- [x] 2.2 Apply `bg-surface-subtle` to table header row
- [x] 2.3 Add `divide-y divide-border-default` to table body
- [x] 2.4 Ensure mobile card list uses consistent `divide-y divide-border-default` styling
- [x] 2.5 Update category badges to use `rounded-full bg-surface-subtle`
- [x] 2.6 Ensure typography uses `meta-text`, `font-display`, and proper sizes
- [x] 2.7 Update "Oeffnen" button to use `btn-secondary` class consistently

## 3. Filter UI Updates

- [x] 3.1 Update category chips to use inline-flex with proper border-radius
- [x] 3.2 Apply `bg-action-primary` with white text for active chip state
- [x] 3.3 Add hover state with subtle background change
- [x] 3.4 Ensure search input uses `rounded-control`, proper border colors, and focus state

## 4. Empty State Updates

- [x] 4.1 Verify empty state shows "Keine Links vorhanden" with card styling
- [x] 4.2 Verify filtered empty state shows "Keine passenden Links gefunden" with hint text
- [x] 4.3 Ensure filtered count display shows "{count} von {total} Links sichtbar"

## 5. Testing and Validation

- [x] 5.1 Run `npm run check` to verify TypeScript types
- [x] 5.2 Run `npm run build` to verify static build succeeds
- [x] 5.3 Test on mobile viewport (375px) - verify card list renders
- [x] 5.4 Test on desktop viewport (1024px) - verify table renders
- [x] 5.5 Verify RSS fetch works and dynamic data displays (or falls back gracefully)
