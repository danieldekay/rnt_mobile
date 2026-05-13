# Tasks

## 1. Desktop Shell Foundation

- [x] 1.1 Add desktop shell CSS custom properties in `src/app.css` and verify with `npm run check`.
- [x] 1.2 Create `src/lib/components/LeftSidebar.svelte` with desktop-only sticky navigation, active-route highlighting, and legal footer links.
- [x] 1.3 Create `src/lib/components/RightSidebar.svelte` as an optional desktop-only contextual aside wrapper.
- [x] 1.4 Create `src/lib/components/DesktopLayout.svelte` with mobile passthrough and desktop grid shell using left + optional right sidebars.

## 2. Integration And Verification

- [x] 2.1 Wire `DesktopLayout` into `src/routes/+layout.svelte` while preserving mobile behavior.
- [x] 2.2 Validate implementation with `npm run check` and `npm run build`, and run visual smoke-test checks for desktop/mobile shell behavior.
