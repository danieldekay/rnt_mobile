---
type: Component
title: Component System
description: Svelte 5 UI components, design tokens, and the component architecture for the RNT Mobile app.
tags: [components, svelte, ui, design-tokens, css]
sources:
  - id: inventory
    resource: /sources/INVENTORY.md
    title: RNT Mobile Project Inventory
  - id: design-system
    resource: /sources/DESIGN_SYSTEM.md
    title: Design System Documentation
  - id: component-usage
    resource: /sources/COMPONENT_USAGE.md
    title: Component Usage Guide
  - id: implementation
    resource: /sources/IMPLEMENTATION_SUMMARY.md
    title: Implementation Summary
generated: { by: agent/copilot, at: 2026-07-25T21:10:00Z }
status: stable
---

# Component System

The UI is built with Svelte 5 components, Tailwind CSS v4, and a custom design token system.

## Component Inventory

### Route Pages

| Route | File | Purpose |
|-------|------|---------|
| `/` | `src/routes/+page.svelte` | Homepage — event list with filters, search, map toggle |
| `/calendar` | `src/routes/calendar/+page.svelte` | Calendar month view with date selector |
| `/event/[id]` | `src/routes/event/[id]/+page.svelte` | Single event detail view |
| `/impressum` | `src/routes/impressum/+page.svelte` | Legal: Impressum |
| `/datenschutz` | `src/routes/datenschutz/+page.svelte` | Legal: Privacy policy |
| `/cookie-richtlinie` | `src/routes/cookie-richtlinie/+page.svelte` | Legal: Cookie policy |
| `/was-ist-neu` | `src/routes/was-ist-neu/+page.svelte` | Changelog / release notes |

### Layout

| File | Purpose |
|------|---------|
| `src/routes/+layout.svelte` | App layout: header (nav + PWA install btn), consent banner, PWA update banner, footer |
| `src/routes/+layout.ts` | `prerender: true`, `ssr: false` |

### Core Components

| Component | File | Purpose |
|-----------|------|---------|
| `Calendar` | `src/lib/components/Calendar.svelte` | Month grid calendar — date navigation, event overlays, highlight today/selected/past |
| `ConsentPlaceholder` | `src/lib/components/ConsentPlaceholder.svelte` | PII-consent gate card (maps) |
| `DateFilter` | `src/lib/components/DateFilter.svelte` | Horizontal date-range button row (Heute, 7 Tage, Monat, Alle) |
| `DateSelector` | `src/lib/components/DateSelector.svelte` | Day-by-day nav bar (← Today →) — used on calendar route |
| `EventCard` | `src/lib/components/EventCard.svelte` | Event list item — date chip, badge, venue, time, price, DJ/organizer, image |
| `FilterChip` | `src/lib/components/FilterChip.svelte` | Type filter chip (Milongas, Practicas, Workshops, Kurse) |
| `LegalDocument` | `src/lib/components/LegalDocument.svelte` | Fetches legal page from WP REST API, renders content with fallback |
| `MusicFilterChip` | `src/lib/components/MusicFilterChip.svelte` | Music filter chip (Traditionell, 50%, Neo) |
| `NewsletterSignup` | `src/lib/components/NewsletterSignup.svelte` | Newsletter form (email + honeypot), POSTs to `/api/newsletter/subscribe` |
| `PwaInstallButton` | `src/lib/components/PwaInstallButton.svelte` | Install CTA in header; opens modal or native prompt |
| `PwaInstallModal` | `src/lib/components/PwaInstallModal.svelte` | Browser-specific installation instructions panel + native prompt trigger |
| `PwaUpdateBanner` | `src/lib/components/PwaUpdateBanner.svelte` | PWA update available / update-check-failed banner |

### Enhanced Components

| Component | File | Purpose |
|-----------|------|---------|
| `OrganizerCard` | `src/lib/components/OrganizerCard.svelte` | Complete organizer display with social media, contact, verification |
| `VenueCard` | `src/lib/components/VenueCard.svelte` | Complete venue display with facilities, location, contact |

### Base Components

| Component | File | Purpose |
|-----------|------|---------|
| `Card` | `src/lib/components/Card.svelte` | Reusable card container |
| `Button` | `src/lib/components/Button.svelte` | Button with variants and states |
| `Heading` | `src/lib/components/Heading.svelte` | Heading component system |
| `Text` | `src/lib/components/Text.svelte` | Text component with size/color/weight |
| `Badge` | `src/lib/components/Badge.svelte` | Status and label badges |
| `Avatar` | `src/lib/components/Avatar.svelte` | Profile image display |
| `Divider` | `src/lib/components/Divider.svelte` | Content separators |

## Design Token System

The design system uses CSS custom properties defined in `src/app.css`:

### Color Tokens

10-shade scale for each color family:
- `color-primary-*` (blue)
- `color-secondary-*` (gray)
- `color-accent-*` (pink)
- `color-success-*` (green)
- `color-error-*` (red)
- `color-warning-*` (amber)
- `color-info-*` (blue)
- `color-neutral-*` (zinc)

### Typography Tokens

- Font families: Atkinson Hyperlegible Next (body), IBM Plex Sans Condensed (display)
- Size scale: xs through 6xl
- Weight, line-height, letter-spacing tokens

### Spacing Scale

`spacing-0` through `spacing-24` — consistent spacing rhythm.

### Component Tokens

- Button tokens (variants, sizes, states)
- Card tokens (padding, radius, shadow)
- Form tokens (input, label, error)
- Chip tokens (active/inactive states)

## Store Architecture

Svelte 5 rune-based stores in `src/lib/stores/`:

| Store | File | Purpose |
|-------|------|---------|
| `eventStore` | `events.svelte.ts` | Events, filters, search, load/toggle logic |
| `consentStore` | `consent.svelte.ts` | GDPR consent — essential, analytics, maps |
| `pwaInstallStore` | `pwa-install.svelte.ts` | PWA install flow — beforeinstallprompt, platform detection |
| `pwaUpdateStore` | `pwa-update.svelte.ts` | PWA update checking — syncs with SvelteKit `updated` |

## Accessibility

- WCAG 2.1 compliant components
- ARIA attributes throughout
- Keyboard navigation support
- Screen reader announcements
- Focus management
- Atkinson Hyperlegible Next font for readability

## Cross-References

- [Design Tokens](/concepts/design-tokens.md) — full token reference
- [Event Lifecycle](/concepts/event-lifecycle.md) — how data flows into components
- [Architecture](/concepts/architecture.md) — system-level structural decisions
- [PWA System](/concepts/pwa-system.md) — PWA install/update components
