# Tasks

## Prerequisites

- `desktop-layout-foundation` applied.

---

## Task List

- [x] 1.1 Restructure `src/routes/event/[id]/+page.svelte` for a two-column desktop layout by extracting the existing metadata block into a `{#snippet rightSidebar()}` and making the sidebar sticky. Validate with `npm run check`.
- [x] 1.2 In `src/routes/event/[id]/+page.svelte`, render a metadata-panel CTA button as `<a href={event.url} class="btn-primary w-full">Zur Anmeldung</a>` when `event.url` exists. Validate with `npm run check`.
- [x] 1.3 Perform a visual smoke pass for desktop two-pane layout, sticky sidebar on scroll, and unchanged mobile behavior. Validate with `npm run build`.
