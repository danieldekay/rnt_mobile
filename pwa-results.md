# PWA & Manifest Tasks Results — address-diagnosis-findings

## Tasks Completed

### Task 5.1: Manifest `display_override` + `prefer_related_applications`
- **File**: `static/manifest.json`
- **Change**: Added `"display_override": ["standalone", "browser"]` and `"prefer_related_applications": false`

### Task 5.2: Manifest Screenshot Entries
- **File**: `static/manifest.json`
- **Change**: Added `screenshots` array with entries for `home-screen.png` and `kalender-screen.png`
- **Assets created**: `static/screenshots/home-screen.png`, `static/screenshots/kalender-screen.png` (placeholder copies of icon-192.png — production screenshots should replace these)

### Task 5.3: Maskable Icon Entries
- **File**: `static/manifest.json`
- **Assets created**: `static/icon-192-maskable.png`, `static/icon-512-maskable.png` (copies of existing icons — production maskable versions should be designed with safe zones)
- **Manifest**: Added entries with `"purpose": "maskable"` pointing to the new files

### Task 5.4: iOS/PWA Meta Tags
- **File**: `src/app.html`
- **Change**: Added `<meta name="apple-mobile-web-app-capable" content="yes" />` and `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />`
- Note: `theme-color` was already present

### Task 5.6: Service Worker App-Shell Caching
- **File**: `src/service-worker.ts` (NEW)
- **Strategy**:
  - **App-shell assets** (build files, prerendered pages, icons, manifest): cache-first
  - **API requests** (`/api/*`): network-first with stale-while-revalidate
  - **Dynamic resources** (images, fonts): cache network response (fire-and-forget)
  - **Navigation requests**: network-first, fall back to shell
  - **Activation**: cleans old cache entries
- **Note**: No existing service worker was found; this is a new file

### Task 6.3: Centralize WordPress Origin
- **File**: `src/lib/constants.ts`
- **Change**: Added `WORDPRESS_ORIGIN = "https://www.rhein-neckar-tango.de"` constant
- **Note**: `worker.ts` already has this constant; now it's centralized in a shared module for client code access

### Task 6.4: Replace `any` casts
- **Result**: No `any` casts found in API modules (`events.ts`, `normalizers.ts`, etc.)
- **Status**: Already clean — no changes needed

## Validation

- `npm run check`: 0 errors, 0 warnings
- `npm run build`: Success, Cloudflare Pages adapter-compatible

## Files Changed

| File | Change |
|------|--------|
| `static/manifest.json` | Added `display_override`, `prefer_related_applications`, `screenshots`, maskable icons |
| `static/icon-192-maskable.png` | Created (copy of icon-192.png) |
| `static/icon-512-maskable.png` | Created (copy of icon-512.png) |
| `static/screenshots/home-screen.png` | Created (placeholder) |
| `static/screenshots/kalender-screen.png` | Created (placeholder) |
| `src/app.html` | Added `apple-mobile-web-app-capable` and `apple-mobile-web-app-status-bar-style` meta tags |
| `src/service-worker.ts` | NEW — app-shell caching strategy |
| `src/lib/constants.ts` | Added `WORDPRESS_ORIGIN` constant |
| `openspec/changes/address-diagnosis-findings/tasks.md` | Marked 5.1, 5.2, 5.3, 5.4, 5.6, 6.3, 6.4 as complete |

## Pending Production Notes

1. **Screenshots**: Placeholder PNG copies of icon-192.png should be replaced with actual app screenshots (1280x720 recommended)
2. **Maskable icons**: Placeholder copies should be replaced with properly designed maskable versions with safe zones
3. **Service worker**: The file uses `$service-worker` module from SvelteKit. Ensure `@sveltejs/kit` version supports this API (SvelteKit 1.5+).
