## Design

### Overview

This change introduces pure layout infrastructure — three new Svelte components and targeted updates to the root layout and global CSS. No routes, stores, or API modules change. Mobile behaviour is fully preserved.

---

### Affected Files

| File | Change type | Notes |
|---|---|---|
| `src/app.css` | Edit | Add desktop shell CSS custom properties and `@layer` utilities |
| `src/routes/+layout.svelte` | Edit | Wrap existing content in `DesktopLayout`, pass `LeftSidebar` and `RightSidebar` slot |
| `src/lib/components/DesktopLayout.svelte` | **New** | Three-column grid shell, Tailwind `lg:` breakpoint |
| `src/lib/components/LeftSidebar.svelte` | **New** | 240 px fixed nav sidebar, hidden on mobile |
| `src/lib/components/RightSidebar.svelte` | **New** | 320 px contextual panel slot, hidden on mobile when no content |

---

### Component Architecture

```
src/routes/+layout.svelte
  └── DesktopLayout.svelte        (shell)
        ├── LeftSidebar.svelte    (slot: left)  — desktop only
        ├── <main>                (children)
        └── RightSidebar.svelte   (slot: right) — desktop only, optional
```

#### `DesktopLayout.svelte`

```svelte
<script lang="ts">
  import LeftSidebar from './LeftSidebar.svelte';
  import RightSidebar from './RightSidebar.svelte';
  let { children, rightSidebar } = $props();
</script>

<!-- Mobile: passthrough -->
<div class="lg:hidden">{@render children()}</div>

<!-- Desktop: three-column grid -->
<div class="hidden lg:grid" style="grid-template-columns: 240px 1fr auto;">
  <LeftSidebar />
  <main class="min-w-0 max-w-[800px] px-8 py-6">{@render children()}</main>
  {#if rightSidebar}
    <RightSidebar>{@render rightSidebar()}</RightSidebar>
  {/if}
</div>
```

> Exact markup and Tailwind classes to be finalised during implementation. The key constraint is CSS Grid with `240px 1fr [320px]` columns.

#### `LeftSidebar.svelte`

- Uses `$page` store to determine active route for `aria-current` and active-link styling.
- Nav items use `resolve()` for correct base-path href values.
- Fixed positioning with `position: sticky; top: 0; height: 100dvh; overflow-y: auto`.
- Design tokens used: `--surface-card` background, `--border-default` right border, `--action-primary` active indicator.

#### `RightSidebar.svelte`

- Thin wrapper: `<aside class="w-[320px] border-l border-border-default px-6 py-6 sticky top-0 h-dvh overflow-y-auto">{@render children()}</aside>`.
- Route pages provide content via `rightSidebar` snippet prop passed through `DesktopLayout`.

---

### CSS Additions (`src/app.css`)

Add desktop shell spacing variables after existing token block:

```css
--desktop-sidebar-width: 240px;
--desktop-right-sidebar-width: 320px;
--desktop-content-max-width: 800px;
```

---

### `+layout.svelte` Changes

- Import `DesktopLayout`.
- Replace the single `<main>` wrapper with `<DesktopLayout>` at the top level.
- Mobile-specific elements (PWA banners, header, footer) remain outside `DesktopLayout` or are handled within it with breakpoint guards.
- The existing `max-w-xl` constraint on `<main>` is retained for mobile and removed for desktop via the grid column.

---

### Design Token Mapping

| Element | Token |
|---|---|
| Sidebar background | `--surface-card` |
| Sidebar border | `--border-default` |
| Active nav indicator | `--action-primary` |
| Active nav bg | `--surface-subtle` |
| Sidebar text | `--text-default` |
| Sidebar muted text | `--text-muted` |

---

### Stitch Reference

Design screens: https://stitch.withgoogle.com/projects/6101620989348291389  
Key screens for this change: Veranstaltungen (left sidebar structure), all screens share the same sidebar.

---

### Validation

```bash
npm run check   # Type-check — must pass with 0 errors
npm run build   # Static export — must succeed
```
