## Why

The Links & Ressourcen page currently displays curated links in a table with outdated styling that doesn't match the app's modern design language. Additionally, despite having RSS feed fetching code implemented, the page falls back to hardcoded static data instead of displaying dynamic content from the WordPress link library feed. This prevents the app from showing curated community links that are maintained on the WordPress backend.

## What Changes

- Update the Links table UI to use consistent styling patterns matching other app components (AgendaPanel, event cards)
- Fix RSS feed data fetching so dynamic links are actually displayed instead of falling back to hardcoded data
- Ensure proper error handling and fallback behavior when RSS feed is unavailable

### New Capabilities

- `links-rss-fetch`: Fetch and display curated links from the WordPress RSS feed endpoint instead of hardcoded static data

### Modified Capabilities

- `links-resources`: The existing table display needs visual refinements to match the current design system

## Impact

**Affected Routes:**
- `/links` - Links & Ressourcen page

**Affected Files:**
- `src/routes/links/+page.svelte` - UI updates for table styling
- `src/routes/links/+page.ts` - RSS fetch logic adjustments
- `src/lib/api/links.ts` - Feed fetching improvements

**Data Source:**
- Currently: Falls back to static array in `src/lib/content/links.ts`
- After: Fetches from `https://www.rhein-neckar-tango.de/feed/linklibraryfeed?settingsset=1`

**Deployment:**
- No prerendering changes needed
- Static adapter compatible (fetch happens at runtime)