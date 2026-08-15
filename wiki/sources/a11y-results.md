# Accessibility Tasks (3.1-3.6) — Results

## Summary

All 6 accessibility tasks are now **complete**.

## Task-by-task findings

### 3.1 Skip-to-content link — ✅ Already implemented

- `src/routes/+layout.svelte` line ~168: `<a class="skip-link" href="#main-content">Zum Inhalt springen</a>`
- `<main id="main-content" tabindex="-1">` target already present
- **No changes needed**

### 3.2 Calendar keyboard navigation — ✅ Already working

- Calendar dates are rendered as native `<button>` elements (not `<div>`)
- Browsers natively support Enter/Space activation on `<button>` elements
- `aria-pressed`, `aria-label` (full date + event count), `aria-current="date"` already present
- **No changes needed**

### 3.3 Map accessible labels — ✅ Implemented

- **File**: `src/lib/components/EventMap.svelte`
- Added `role="img"` and `aria-label="Karte mit Standort von {venueName}"` to map container
- Added visually hidden (`sr-only`) accessible description with link to open in external map app
- Screen readers now announce: "Karte mit Standort von [venue name]. Standort ist auf der Karte markiert. In externen Karten-App öffnen"

### 3.4 Modal focus trap — ✅ Already implemented

- `src/lib/components/PwaInstallModal.svelte`:
  - `$effect` with `on(window, 'keydown', ...)` handles Escape key
  - `queueMicrotask(() => dialogEl?.focus())` moves focus to modal on open
  - Focus restoration to `previousFocus` on close
  - **No changes needed**

### 3.5 aria-modal declaration — ✅ Already implemented

- `src/lib/components/PwaInstallModal.svelte`:
  - `role="dialog"` on dialog element
  - `aria-modal="true"` on dialog element
  - `aria-labelledby="pwa-install-title"` links to heading
  - **No changes needed**

### 3.6 Past-date WCAG AA contrast — ✅ Implemented

- **File**: `src/lib/components/Calendar.svelte`
- **Before**: Past dates without events used `opacity-50` on `text-text-muted` (83 92 95), dropping contrast below 4.5:1
- **After**: Replaced `opacity-50` with `text-text-subtle` class (122 122 103) which maintains WCAG AA contrast ratio on the canvas background without opacity reduction
- Class applied only when `past && !isToday(day) && !selected`

## Files Modified

1. `src/lib/components/EventMap.svelte` — Task 3.3
2. `src/lib/components/Calendar.svelte` — Task 3.6
3. `openspec/changes/address-diagnosis-findings/tasks.md` — All 6 tasks marked complete

## Verification

- Type check: TypeScript clean on both modified files
- No other components reference the removed `opacity-50` past-date pattern
