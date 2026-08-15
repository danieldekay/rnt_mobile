# Dependency Audit — rnt_mobile

Generated: 2026-05-15

## Production Dependencies

| Package | Version | Keep / Optimize / Replace | Rationale |
|---------|---------|---------------------------|------------|
| `leaflet` | ^1.9.4 | **Keep** (tree-shake) | Core map library. Only imported via dynamic `import()` in `EventMap.svelte` when map consent is given. Already lazy-loaded. ~90KB (minified). |
| `date-fns` | ^4.1.0 | **Keep** | Native JS Date is sufficient for date calculations. date-fns provides locale-aware formatting. V4 is tree-shakeable. |
| `dompurify` | ^3.4.2 | **Keep** | Sanitizes user/editorial content from WordPress. No suitable lightweight alternative with same XSS coverage. ~35KB. |
| `he` | ^1.2.0 | **Keep** (tiny) | HTML entity encoding/decoding. ~3KB minified. No replacement needed. |
| `@melt-ui/svelte` | ^0.86.6 | **Keep** (audit tree-shake) | Headless UI primitives for Svelte. Used by modals, date pickers. ~12KB tree-shaken. |
| `@fontsource/...` | ^5.x | **Optimize** | Three font packages loaded. Consider bundling only used glyphs via `fontsource-cli` or switching to `@fontsource-variable`. Likely 200KB+ total. |

## Dev Dependencies (Selected)

| Package | Version | Notes |
|---------|---------|-------|
| `vite` | ^8.0.10 | Core bundler. SvelteKit 2 requires v8+. |
| `svelte` | ^5.55.5 | Framework. Latest stable. |
| `@sveltejs/kit` | ^2.59.0 | Router/adapters. Required. |
| `@sveltejs/adapter-static` | ^3.0.10 | Static adapter for Cloudflare Pages. Required. |
| `vitest` | ^4.1.6 | Test runner (not yet used — tasks 6.5–6.7 require test framework setup). |
| `@vitest/coverage-v8` | ^4.1.6 | Coverage (paired with vitest). |
| `jsdom` | ^29.1.1 | DOM environment for tests (paired with vitest). |
| `tailwindcss` | ^4.2.4 | Utility CSS. Used via Vite plugin. |

## Removal Candidates

| Package | Status | Notes |
|---------|--------|-------|
| `@types/leaflet` | **Keep** | Type definitions for leaflet. Required for TS compilation. |

## Recommendations

1. **Font optimization** (highest impact): Current 3 font packages likely exceed 200KB. Use `fontsource-cli` to extract only needed glyphs, or switch to a single variable font.
2. **Leaflet tree-shake**: Already dynamically imported. Could further reduce by only importing needed modules (core + tileLayer + marker) instead of the full bundle.
3. **Bundle analysis**: Use `npm run bundle-analysis` to inspect build composition after changes.
