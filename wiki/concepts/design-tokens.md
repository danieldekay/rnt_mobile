---
type: Design Token
title: Design Tokens
description: CSS custom properties for colors, typography, spacing, and component-level design decisions.
tags: [design-tokens, css, colors, typography, spacing]
sources:
  - id: design-system
    resource: /sources/DESIGN_SYSTEM.md
    title: Design System Documentation
  - id: inventory
    resource: /sources/INVENTORY.md
    title: RNT Mobile Project Inventory
generated: { by: agent/copilot, at: 2026-07-25T21:10:00Z }
status: stable
---

# Design Tokens

Design tokens are CSS custom properties defined in `src/app.css` that drive the visual system.

## Color Tokens

10-shade scale (50-900) for each color family:

### Primary (Blue)
```css
--color-primary-50: #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6;
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;
```

### Secondary (Gray)
```css
--color-secondary-50: #f3f4f6;
--color-secondary-100: #e5e7eb;
--color-secondary-200: #d1d5db;
--color-secondary-300: #9ca3af;
--color-secondary-400: #6b7280;
--color-secondary-500: #4b5563;
--color-secondary-600: #374151;
--color-secondary-700: #1f2937;
--color-secondary-800: #111827;
--color-secondary-900: #030712;
```

### Accent (Pink)
```css
--color-accent-50: #fdf2f8;
--color-accent-100: #fce7f3;
--color-accent-200: #fbcfe8;
--color-accent-300: #f9a8d4;
--color-accent-400: #f472b6;
--color-accent-500: #ec4899;
--color-accent-600: #db2777;
--color-accent-700: #be185d;
--color-accent-800: #9d174d;
--color-accent-900: #831843;
```

### Semantic Colors
- `color-success-*` (green) — success states
- `color-error-*` (red) — error states
- `color-warning-*` (amber) — warning states
- `color-info-*` (blue) — info states

### Neutral (Zinc)
```css
--color-neutral-50: #fafafa;
--color-neutral-100: #f4f4f5;
--color-neutral-200: #e4e4e7;
--color-neutral-300: #d4d4d8;
--color-neutral-400: #a1a1aa;
```

## Typography Tokens

### Font Families
```css
--font-family-body: 'Atkinson Hyperlegible Next', sans-serif;
--font-family-display: 'IBM Plex Sans Condensed', sans-serif;
```

### Font Sizes
`text-xs` through `text-6xl` — consistent type scale.

### Font Weights
Regular, medium, semibold, bold.

### Line Heights
Tight, normal, relaxed.

### Letter Spacing
Tighter, tight, normal, wide, wider.

## Spacing Scale

`spacing-0` through `spacing-24` — consistent spacing rhythm based on 0.25rem increments.

## Component Tokens

### Button Tokens
- Variants: primary, secondary, accent, ghost
- Sizes: sm, md, lg
- States: default, hover, active, disabled, focus

### Card Tokens
- Padding, radius, shadow
- Variants: elevated, outlined, filled

### Form Tokens
- Input: padding, border, radius, focus ring
- Label: size, weight, color
- Error: color, icon

### Chip Tokens
- Active/inactive states
- Type-specific accent colors

## Dark Mode

Dark mode support via CSS custom properties with `prefers-color-scheme` media query or manual toggle.

## Utility Functions

`src/lib/utils/design-tokens.ts` provides programmatic access:

```typescript
getToken('color-primary-500')  // Returns CSS custom property value
```

## Cross-References

- [Component System](/concepts/component-system.md) — how tokens apply to components
- [Architecture](/concepts/architecture.md) — system-level structural decisions
