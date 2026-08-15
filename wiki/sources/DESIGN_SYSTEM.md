# Design System Documentation

## Overview

This design system provides a comprehensive foundation for the RNT Mobile application, built with Svelte 5, TypeScript, and modern CSS practices. The system ensures consistency, accessibility, and maintainability across all components.

## Design Tokens

### Color Tokens

The color system uses a 10-shade scale for each color family, implemented as CSS custom properties:

```css
/* Primary Colors */
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

/* Secondary Colors */
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

/* Accent Colors */
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

/* Semantic Colors */
--color-success-50: #f0fdf4;
--color-success-100: #dcfce7;
--color-success-200: #bbf7d0;
--color-success-300: #86efac;
--color-success-400: #4ade80;
--color-success-500: #22c55e;
--color-success-600: #16a34a;
--color-success-700: #15803d;
--color-success-800: #166534;
--color-success-900: #14532d;

--color-error-50: #fef2f2;
--color-error-100: #fee2e2;
--color-error-200: #fecaca;
--color-error-300: #fca5a5;
--color-error-400: #f87171;
--color-error-500: #ef4444;
--color-error-600: #dc2626;
--color-error-700: #b91c1c;
--color-error-800: #991b1b;
--color-error-900: #7f1d1d;

--color-warning-50: #fffbeb;
--color-warning-100: #fef3c7;
--color-warning-200: #fde68a;
--color-warning-300: #fcd34d;
--color-warning-400: #fbbf24;
--color-warning-500: #f59e0b;
--color-warning-600: #d97706;
--color-warning-700: #b45309;
--color-warning-800: #92400e;
--color-warning-900: #78350f;

--color-info-50: #eff6ff;
--color-info-100: #dbeafe;
--color-info-200: #bfdbfe;
--color-info-300: #93c5fd;
--color-info-400: #60a5fa;
--color-info-500: #3b82f6;
--color-info-600: #2563eb;
--color-info-700: #1d4ed8;
--color-info-800: #1e40af;
--color-info-900: #1e3a8a;

/* Neutral Colors */
--color-neutral-50: #fafafa;
--color-neutral-100: #f4f4f5;
--color-neutral-200: #e4e4e7;
--color-neutral-300: #d4d4d8;
--color-neutral-400: #a1a1aa;
--color-neutral-500: #71717a;
--color-neutral-600: #52525b;
--color-neutral-700: #3f3f46;
--color-neutral-800: #27272a;
--color-neutral-900: #18181b;
```

### Typography Tokens

Font sizes follow a consistent scale with proper line heights:

```css
/* Font Sizes */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */
--text-5xl: 3rem; /* 48px */
--text-6xl: 3.75rem; /* 60px */

/* Font Weights */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;

/* Letter Spacing */
--tracking-tighter: -0.025em;
--tracking-tight: -0.0125em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
```

### Spacing Tokens

Consistent spacing scale following a mathematical progression:

```css
/* Spacing Scale */
--spacing-0: 0;
--spacing-1: 0.25rem; /* 4px */
--spacing-2: 0.5rem; /* 8px */
--spacing-3: 0.75rem; /* 12px */
--spacing-4: 1rem; /* 16px */
--spacing-5: 1.25rem; /* 20px */
--spacing-6: 1.5rem; /* 24px */
--spacing-7: 1.75rem; /* 28px */
--spacing-8: 2rem; /* 32px */
--spacing-9: 2.25rem; /* 36px */
--spacing-10: 2.5rem; /* 40px */
--spacing-12: 3rem; /* 48px */
--spacing-16: 4rem; /* 64px */
--spacing-20: 5rem; /* 80px */
--spacing-24: 6rem; /* 96px */
```

### Component Tokens

```css
/* Button Variants */
--btn-primary-bg: var(--color-primary-600);
--btn-primary-hover: var(--color-primary-700);
--btn-secondary-bg: var(--color-secondary-600);
--btn-secondary-hover: var(--color-secondary-700);
--btn-accent-bg: var(--color-accent-600);
--btn-accent-hover: var(--color-accent-700);

/* Card Styling */
--card-bg: var(--color-neutral-50);
--card-border: var(--color-neutral-200);
--card-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--card-shadow-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

/* Border Radius */
--radius-none: 0;
--radius-sm: 0.25rem;
--radius: 0.375rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

## Components

### Card Component

A flexible container component for grouping related content.

**Props:**

- `variant`: "default" | "elevated" | "outlined"
- `padding`: "none" | "sm" | "md" | "lg" | "xl"
- `radius`: "none" | "sm" | "md" | "lg" | "xl" | "full"
- `shadow`: "none" | "sm" | "md" | "lg" | "xl"
- `responsive`: boolean (default: true)

**Usage:**

```svelte
<Card variant="elevated" padding="md" radius="lg">
    <h3>Card Title</h3>
    <p>Card content goes here</p>
</Card>
```

### Button Component

A versatile button component with multiple variants and states.

**Props:**

- `variant`: "primary" | "secondary" | "accent" | "outline" | "ghost" | "link"
- `size`: "sm" | "md" | "lg" | "xl"
- `disabled`: boolean
- `loading`: boolean
- `fullWidth`: boolean
- `leftIcon`: string | null
- `rightIcon`: string | null

**Usage:**

```svelte
<Button variant="primary" size="md" on:click={handleClick}>
    Click me
</Button>

<Button variant="secondary" size="sm" disabled>
    Disabled
</Button>
```

### Typography Components

#### Heading Component

**Props:**

- `level`: 1-6 (for h1-h6)
- `size`: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl"
- `weight`: "regular" | "medium" | "semibold" | "bold"

**Usage:**

```svelte
<Heading level={1} size="3xl" weight="bold">
    Main Title
</Heading>

<Heading level={2} size="xl" weight="semibold">
    Subtitle
</Heading>
```

#### Text Component

**Props:**

- `size`: "xs" | "sm" | "base" | "lg" | "xl"
- `color`: "primary" | "secondary" | "accent" | "success" | "error" | "warning" | "info" | "neutral" | "muted"
- `weight`: "regular" | "medium" | "semibold" | "bold"

**Usage:**

```svelte
<Text size="sm" color="muted" weight="medium">
    This is muted text
</Text>

<Text size="base" color="primary" weight="semibold">
    This is primary text
</Text>
```

### Badge Component

Small status and label components.

**Props:**

- `variant`: "primary" | "secondary" | "accent" | "success" | "warning" | "error" | "info" | "muted"
- `size`: "sm" | "md"

**Usage:**

```svelte
<Badge variant="success" size="sm">
    Active
</Badge>

<Badge variant="warning" size="md">
    Pending
</Badge>
```

### Avatar Component

Profile picture display with fallbacks.

**Props:**

- `src`: string | null
- `alt`: string
- `size`: "sm" | "md" | "lg"
- `shape`: "circle" | "square"

**Usage:**

```svelte
<Avatar src="/avatar.jpg" alt="User" size="md" shape="circle" />
```

### Divider Component

Visual separator between content sections.

**Props:**

- `orientation`: "horizontal" | "vertical"
- `spacing`: "sm" | "md" | "lg"

**Usage:**

```svelte
<Divider orientation="horizontal" spacing="md" />
```

## Enhanced Components

### OrganizerCard Component

A comprehensive component for displaying organizer information with social media integration, contact details, and verification status.

**Key Features:**

- Profile image with fallbacks
- Social media links with URL validation
- Contact information formatting
- Event statistics display
- Verification badges
- Responsive design

**Props:**

- `organizer`: EnhancedOrganizer
- `showStats`: boolean
- `responsive`: boolean

### VenueCard Component

A detailed component for displaying venue information with facilities, contact details, and location information.

**Key Features:**

- Image gallery with fallbacks
- Facilities and amenities display
- Contact information with formatting
- Location display with coordinates
- Social media integration
- Responsive design

**Props:**

- `venue`: EnhancedVenue
- `responsive`: boolean

## Utility Functions

### Design Token Utilities

```typescript
// Access design tokens programmatically
import { getToken } from "$lib/utils/design-tokens";

const primaryColor = getToken("color-primary-500");
const fontSize = getToken("text-lg");
```

### Data Validation

```typescript
// Validate and sanitize organizer data
import {
  validateOrganizer,
  sanitizeOrganizer,
} from "$lib/utils/data-validation";

const validatedOrganizer = validateOrganizer(rawOrganizerData);
const sanitizedOrganizer = sanitizeOrganizer(validatedOrganizer);
```

### Error Handling

```typescript
// Enhanced error handling
import { handleApiError, createFallbackData } from "$lib/utils/error-handling";

try {
  const data = await fetchOrganizerData();
} catch (error) {
  const fallback = createFallbackData("organizer");
  handleApiError(error, fallback);
}
```

### Caching

```typescript
// Cache management
import { CacheManager } from "$lib/utils/caching";

const cache = new CacheManager({
  ttl: 300000, // 5 minutes
  maxSize: 100, // max 100 items
});

// Set cache
cache.set("organizer-123", organizerData);

// Get cache
const cachedData = cache.get("organizer-123");
```

## Accessibility

All components follow WCAG 2.1 guidelines:

- **Keyboard Navigation**: Full keyboard support with proper focus management
- **Screen Reader Support**: ARIA attributes and semantic HTML
- **Color Contrast**: All text meets WCAG AA contrast requirements
- **Focus Indicators**: Visible focus states for keyboard users
- **Screen Reader Announcements**: Proper ARIA labels and descriptions

## Responsive Design

The system uses a mobile-first approach:

- **Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Responsive Classes**: Tailwind-style responsive utilities
- **Fluid Typography**: Scalable typography based on viewport size

## Performance

- **Lazy Loading**: Images and heavy components load on demand
- **Caching**: Intelligent caching for API responses
- **Code Splitting**: Automatic code splitting for route-based components
- **Optimization**: Minimal re-renders with Svelte's reactivity system

## Testing

All components include comprehensive tests:

- **Unit Tests**: Vitest for individual component testing
- **Integration Tests**: Testing component interactions
- **Accessibility Tests**: Automated accessibility checks
- **Visual Testing**: Snapshot testing for UI consistency

## Contributing

When adding new components:

1. Follow the existing design token system
2. Include proper TypeScript types
3. Add accessibility attributes
4. Write comprehensive tests
5. Update documentation

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- **Svelte 5**: Modern reactive framework
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **Vitest**: Modern testing framework
- **PostCSS**: CSS processing and optimization
