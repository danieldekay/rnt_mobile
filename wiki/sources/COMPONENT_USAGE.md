# Component Usage Guide

This guide provides detailed instructions on how to use the enhanced components in the RNT Mobile application.

## Getting Started

### Import Components

```typescript
// Basic components
import Card from "$lib/components/Card.svelte";
import Button from "$lib/components/Button.svelte";
import Heading from "$lib/components/Heading.svelte";
import Text from "$lib/components/Text.svelte";
import Badge from "$lib/components/Badge.svelte";
import Avatar from "$lib/components/Avatar.svelte";
import Divider from "$lib/components/Divider.svelte";

// Enhanced components
import OrganizerCard from "$lib/components/OrganizerCard.svelte";
import VenueCard from "$lib/components/VenueCard.svelte";

// Utility functions
import { getToken } from "$lib/utils/design-tokens";
import { validateOrganizer, validateVenue } from "$lib/utils/data-validation";
import { CacheManager } from "$lib/utils/caching";
```

### Basic Setup

```typescript
// Define your data types
interface MyOrganizer {
  id: number;
  title: string;
  description: string;
  featured_image?: string;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  stats?: {
    event_count: number;
    verification_status: "verified" | "pending" | "unverified";
  };
}

interface MyVenue {
  id: number;
  title: string;
  description?: string;
  featured_image?: string;
  location?: {
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  venue_details?: {
    facilities?: string[];
    capacity?: number;
  };
}
```

## Basic Components

### Card Component

The Card component is a versatile container for grouping related content.

#### Props

| Prop         | Type                                               | Default     | Description                |
| ------------ | -------------------------------------------------- | ----------- | -------------------------- |
| `variant`    | `'default' \| 'elevated' \| 'outlined'`            | `'default'` | Visual style variant       |
| `padding`    | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'`           | `'md'`      | Internal spacing           |
| `radius`     | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'`      | Border radius              |
| `shadow`     | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'`           | `'sm'`      | Shadow depth               |
| `responsive` | `boolean`                                          | `true`      | Enable responsive behavior |

#### Usage Examples

```svelte
<!-- Basic Card -->
<Card>
  <h3>Basic Card</h3>
  <p>This is a simple card with default styling.</p>
</Card>

<!-- Elevated Card with Padding -->
<Card variant="elevated" padding="lg" radius="xl">
  <Heading level={2} size="xl">Featured Content</Heading>
  <Text size="base" color="muted">This content stands out with elevation.</Text>
</Card>

<!-- Outlined Card for Important Information -->
<Card variant="outlined" padding="sm">
  <Badge variant="warning" size="sm">Important</Badge>
  <Text size="sm">Please read this information carefully.</Text>
</Card>
```

### Button Component

The Button component provides various button styles and states.

#### Props

| Prop        | Type                                                                     | Default     | Description         |
| ----------- | ------------------------------------------------------------------------ | ----------- | ------------------- |
| `variant`   | `'primary' \| 'secondary' \| 'accent' \| 'outline' \| 'ghost' \| 'link'` | `'primary'` | Button style        |
| `size`      | `'sm' \| 'md' \| 'lg' \| 'xl'`                                           | `'md'`      | Button size         |
| `disabled`  | `boolean`                                                                | `false`     | Disable interaction |
| `loading`   | `boolean`                                                                | `false`     | Loading state       |
| `fullWidth` | `boolean`                                                                | `false`     | Full width button   |
| `leftIcon`  | `string \| null`                                                         | `null`      | Left icon text      |
| `rightIcon` | `string \| null`                                                         | `null`      | Right icon text     |

#### Usage Examples

```svelte
<!-- Primary Button -->
<Button variant="primary" on:click={handlePrimaryAction}>
  Primary Action
</Button>

<!-- Secondary Button with Icon -->
<Button variant="secondary" size="sm" leftIcon="📧">
  Send Email
</Button>

<!-- Accent Button with Loading State -->
<Button variant="accent" loading={isLoading} on:click={handleSubmit}>
  Submit
</Button>

<!-- Outline Button for Cancel -->
<Button variant="outline" on:click={handleCancel}>
  Cancel
</Button>

<!-- Full Width Button -->
<Button variant="ghost" fullWidth on:click={handleContinue}>
  Continue to Next Step
</Button>
```

### Typography Components

#### Heading Component

```svelte
<!-- Different Heading Levels -->
<Heading level={1} size="4xl" weight="bold">Main Title</Heading>
<Heading level={2} size="3xl" weight="semibold">Section Title</Heading>
<Heading level={3} size="2xl" weight="medium">Subsection</Heading>
<Heading level={4} size="xl" weight="regular">Content Title</Heading>
<Heading level={5} size="lg" weight="regular">Small Heading</Heading>
<Heading level={6} size="base" weight="regular">Tiny Heading</Heading>
```

#### Text Component

```svelte
<!-- Different Text Sizes and Colors -->
<Text size="xs" color="muted">Extra small muted text</Text>
<Text size="sm" color="neutral">Small neutral text</Text>
<Text size="base" color="primary">Regular primary text</Text>
<Text size="lg" color="success" weight="semibold">Large success text</Text>
<Text size="xl" color="warning" weight="bold">Extra large warning text</Text>
```

### Badge Component

```svelte
<!-- Status Badges -->
<Badge variant="success" size="sm">Active</Badge>
<Badge variant="warning" size="sm">Pending</Badge>
<Badge variant="error" size="sm">Inactive</Badge>
<Badge variant="info" size="sm">New</Badge>
<Badge variant="primary" size="md">Featured</Badge>

<!-- Category Badges -->
<Badge variant="secondary" size="sm">Tango</Badge>
<Badge variant="accent" size="sm">Milonga</Badge>
<Badge variant="muted" size="sm">Workshop</Badge>
```

### Avatar Component

```svelte
<!-- Different Sizes and Shapes -->
<Avatar src="/avatar.jpg" alt="User" size="sm" shape="circle" />
<Avatar src="/avatar.jpg" alt="User" size="md" shape="circle" />
<Avatar src="/avatar.jpg" alt="User" size="lg" shape="circle" />

<!-- Square Avatar -->
<Avatar src="/logo.png" alt="Organization" size="md" shape="square" />

<!-- Fallback Avatar -->
<Avatar alt="User" size="md" shape="circle" />
```

### Divider Component

```svelte
<!-- Horizontal Divider -->
<Divider orientation="horizontal" spacing="md" />

<!-- Vertical Divider -->
<Divider orientation="vertical" spacing="sm" />

<!-- Custom Divider with Spacing -->
<div class="flex items-center">
  <Text size="sm">Text before</Text>
  <Divider orientation="horizontal" spacing="lg" />
  <Text size="sm">Text after</Text>
</div>
```

## Enhanced Components

### OrganizerCard Component

A comprehensive component for displaying organizer information.

#### Props

| Prop         | Type                | Default  | Description              |
| ------------ | ------------------- | -------- | ------------------------ |
| `organizer`  | `EnhancedOrganizer` | Required | Organizer data object    |
| `showStats`  | `boolean`           | `false`  | Show statistics section  |
| `responsive` | `boolean`           | `true`   | Enable responsive design |

#### Data Structure

```typescript
const organizerData: EnhancedOrganizer = {
  id: 1,
  title: "Tango Club Mannheim",
  description: "Professional tango dancing school and social club",
  slug: "tango-club-mannheim",
  contact: {
    phone: "+49 621 1234567",
    email: "info@tango-club.de",
    website: "https://tango-club.de",
  },
  social_media: {
    facebook: "https://facebook.com/tangomannheim",
    instagram: "https://instagram.com/tangomannheim",
    twitter: "https://twitter.com/tangomannheim",
  },
  stats: {
    event_count: 156,
    verification_status: "verified",
  },
  featured_image: "/images/organizers/tango-club.jpg",
};
```

#### Usage Examples

```svelte
<!-- Basic Organizer Card -->
<OrganizerCard {organizerData} />

<!-- Organizer Card with Stats -->
<OrganizerCard {organizerData} showStats={true} />

<!-- Organizer Card in Responsive Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {#each organizers as organizer}
    <OrganizerCard {organizer} responsive={true} />
  {/each}
</div>
```

#### Styling Options

```svelte
<!-- Custom Styling with CSS Classes -->
<OrganizerCard {organizerData} class="custom-organizer-card" />

<!-- Different Responsive Behavior -->
<OrganizerCard {organizerData} responsive={false} />
```

### VenueCard Component

A detailed component for displaying venue information.

#### Props

| Prop         | Type            | Default  | Description              |
| ------------ | --------------- | -------- | ------------------------ |
| `venue`      | `EnhancedVenue` | Required | Venue data object        |
| `responsive` | `boolean`       | `true`   | Enable responsive design |

#### Data Structure

```typescript
const venueData: EnhancedVenue = {
  id: 1,
  title: "Tanzhaus Mannheim",
  description: "Professional dance venue with excellent wooden floors",
  slug: "tanzhaus-mannheim",
  location: {
    address: "Amalie-Sieveking-Straße 1",
    city: "Mannheim",
    postal_code: "68159",
    country: "Germany",
  },
  contact: {
    phone: "+49 621 1234567",
    email: "info@tanzhaus.de",
    website: "https://tanzhaus-mannheim.de",
  },
  venue_details: {
    facilities: ["Wooden floor", "Bar", "Sound system", "Climate control"],
    capacity: 200,
    parking: "On-site parking available",
  },
  featured_image: "/images/venues/tanzhaus.jpg",
};
```

#### Usage Examples

```svelte
<!-- Basic Venue Card -->
<VenueCard {venueData} />

<!-- Venue Card in Responsive Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  {#each venues as venue}
    <VenueCard {venue} />
  {/each}
</div>

<!-- Venue Card with Custom Container -->
<div class="max-w-md mx-auto">
  <VenueCard {venueData} responsive={true} />
</div>
```

## Advanced Usage

### Combining Components

```svelte
<!-- Complete Event Listing Card -->
<Card variant="elevated" padding="lg" radius="xl">
  <div class="flex items-start gap-4">
    <Avatar src={event.organizer?.featured_image} alt={event.organizer?.title} size="md" shape="circle" />
    <div class="flex-1">
      <Heading level={3} size="lg" weight="semibold">{event.title}</Heading>
      <Text size="sm" color="muted" weight="medium">
        {event.organizer?.title} • {event.date}
      </Text>
      <div class="flex flex-wrap gap-2 mt-2">
        {#each event.categories as category}
          <Badge variant="secondary" size="sm">{category}</Badge>
        {/each}
      </div>
    </div>
  </div>
  <Divider orientation="horizontal" spacing="md" />
  <div class="flex justify-between items-center">
    <Text size="sm" color="neutral">{event.location?.city}</Text>
    <Button variant="primary" size="sm" on:click={handleEventClick}>
      Details
    </Button>
  </div>
</Card>
```

### Using Design Tokens Programmatically

```typescript
// Access design tokens in JavaScript
import { getToken } from "$lib/utils/design-tokens";

// Get color tokens
const primaryColor = getToken("color-primary-600");
const successColor = getToken("color-success-500");

// Get spacing tokens
const padding = getToken("spacing-4");
const margin = getToken("spacing-6");

// Get typography tokens
const fontSize = getToken("text-lg");
const fontWeight = getToken("font-semibold");

// Dynamic styling
function getDynamicStyle(variant: string) {
  const colors = {
    primary: getToken("color-primary-600"),
    secondary: getToken("color-secondary-600"),
    accent: getToken("color-accent-600"),
  };

  return {
    backgroundColor: colors[variant] || colors.primary,
    color: "white",
    padding: getToken("spacing-3"),
    borderRadius: getToken("radius-md"),
  };
}
```

### Data Validation and Error Handling

```typescript
// Validate data before rendering
function validateAndRenderOrganizer(organizerData: any) {
  try {
    const validated = validateOrganizer(organizerData);
    if (!validated.isValid) {
      console.error('Validation errors:', validated.errors);
      return null;
    }
    return validated.data;
  } catch (error) {
    console.error('Validation error:', error);
    return null;
  }
}

// Usage
const safeOrganizer = validateAndRenderOrganizer(rawOrganizerData);
{#if safeOrganizer}
  <OrganizerCard organizer={safeOrganizer} />
{/if}
```

### Caching for Performance

```typescript
// Create cache instance
const organizerCache = new CacheManager({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 50
});

// Cache-aware component
<script lang="ts">
  let organizers: EnhancedOrganizer[] = [];
  let loading = false;

  async function loadOrganizers() {
    loading = true;

    // Check cache first
    const cached = organizerCache.get('all-organizers');
    if (cached) {
      organizers = cached;
      loading = false;
      return;
    }

    // Fetch from API
    try {
      const data = await fetchEnhancedOrganizers();
      organizers = data;
      // Cache the result
      organizerCache.set('all-organizers', data);
    } catch (error) {
      console.error('Failed to load organizers:', error);
      // Use fallback data
      organizers = getFallbackOrganizers();
    } finally {
      loading = false;
    }
  }

  loadOrganizers();
</script>

{#if loading}
  <div class="loading">Loading...</div>
{:else}
  {#each organizers as organizer}
    <OrganizerCard {organizer} />
  {/each}
{/if}
```

### Error Boundaries

```svelte
<!-- Error Boundary Component -->
<script lang="ts">
  let hasError = false;
  let errorMessage = '';

  function handleError(error: Error) {
    hasError = true;
    errorMessage = error.message;
    console.error('Component error:', error);
  }
</script>

{#if hasError}
  <Card variant="outlined" padding="md" class="error-boundary">
    <Text color="error" weight="semibold">
      Something went wrong
    </Text>
    <Text size="sm" color="muted">
      {errorMessage}
    </Text>
    <Button variant="primary" size="sm" on:click={() => hasError = false}>
      Try again
    </Button>
  </Card>
{:else}
  <slot on:error={handleError} />
{/if}
```

## Responsive Design Patterns

### Mobile-First Grid Layout

```svelte
<!-- Responsive Grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {#each items as item}
    <Card variant="elevated" padding="md">
      <ResponsiveImage src={item.image} alt={item.title} />
      <Heading level={4} size="md" weight="semibold">{item.title}</Heading>
      <Text size="sm" color="muted">{item.description}</Text>
      <Button variant="primary" size="sm" fullWidth on:click={() => handleItemClick(item)}>
        View Details
      </Button>
    </Card>
  {/each}
</div>
```

### Responsive Typography

```svelte
<!-- Responsive Heading -->
<Heading
  level={1}
  size={{base: '2xl', sm: '3xl', md: '4xl', lg: '5xl'}}
  weight="bold"
>
  Responsive Title
</Heading>

<!-- Responsive Text -->
<Text
  size={{base: 'sm', sm: 'base', md: 'lg'}}
  color="neutral"
>
  This text scales responsively from small to large.
</Text>
```

## Accessibility Best Practices

### Proper ARIA Labels

```svelte
<!-- Accessible Button -->
<Button
  variant="primary"
  on:click={handleSubmit}
  aria-label="Submit form"
  aria-describedby="submit-help"
>
  Submit
</Button>
<p id="submit-help" class="sr-only">Click to submit your form data</p>

<!-- Accessible Card -->
<Card
  role="article"
  aria-label={organizer.title}
  aria-describedby={organizer.description}
>
  <Heading level={3} size="lg">{organizer.title}</Heading>
  <Text size="sm" color="muted">{organizer.description}</Text>
</Card>
```

### Keyboard Navigation

```svelte
<!-- Keyboard-friendly interactions -->
<div
  role="button"
  tabindex="0"
  on:click={handleClick}
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  aria-label="Click to interact"
>
  Interactive Content
</div>
```

## Performance Optimization

### Lazy Loading Images

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let imageLoaded = false;

  onMount(() => {
    // Simulate lazy loading
    setTimeout(() => {
      imageLoaded = true;
    }, 100);
  });
</script>

{#if imageLoaded}
  <img
    src={organizer.featured_image}
    alt={organizer.title}
    loading="lazy"
    class="w-full h-48 object-cover rounded-lg"
  />
{:else}
  <div class="w-full h-48 bg-gray-200 rounded-lg animate-pulse"></div>
{/if}
```

### Code Splitting

```typescript
// Lazy load components
const OrganizerCard = lazy(() => import('$lib/components/OrganizerCard.svelte'));
const VenueCard = lazy(() => import('$lib/components/VenueCard.svelte'));

// Usage in Svelte
<svelte:component this={OrganizerCard} {organizerData} />
```

## Testing Components

### Unit Testing

```typescript
// OrganizerCard.test.ts
import { render, screen } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import OrganizerCard from "$lib/components/OrganizerCard.svelte";

describe("OrganizerCard", () => {
  it("renders organizer information", () => {
    const organizer = {
      id: 1,
      title: "Test Organizer",
      description: "Test Description",
      featured_image: "/test.jpg",
    };

    render(OrganizerCard, { organizer });

    expect(screen.getByText("Test Organizer")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("handles missing image gracefully", () => {
    const organizer = {
      id: 1,
      title: "Test Organizer",
      description: "Test Description",
    };

    render(OrganizerCard, { organizer });

    expect(screen.getByAltText("Test Organizer")).toBeInTheDocument();
  });
});
```

### Integration Testing

```typescript
// Integration test for organizer list
import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import OrganizerList from "$lib/components/OrganizerList.svelte";

describe("OrganizerList Integration", () => {
  it("displays multiple organizers", () => {
    const organizers = [
      { id: 1, title: "Organizer 1", description: "Description 1" },
      { id: 2, title: "Organizer 2", description: "Description 2" },
    ];

    render(OrganizerList, { organizers });

    expect(screen.getByText("Organizer 1")).toBeInTheDocument();
    expect(screen.getByText("Organizer 2")).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Common Issues

#### TypeScript Errors

```typescript
// If you get TypeScript errors for missing props:
interface ComponentProps {
  // Add all required props here
  requiredProp: string;
  optionalProp?: number;
}

// Use proper typing in your component
<script lang="ts">
  export let requiredProp: string;
  export let optionalProp: number = 42; // with default
</script>
```

#### CSS Issues

```css
/* If components don't look right, check CSS specificity */
.card {
  /* Ensure proper z-index for overlays */
  position: relative;
  z-index: 1;
}

.card:hover {
  /* Proper hover states */
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}
```

#### Performance Issues

```typescript
// If components are slow, check for unnecessary re-renders
<script lang="ts">
  import { derived } from 'svelte/store';

  // Use derived stores for computed values
  const filteredItems = derived(items, ($items) =>
    $items.filter(item => item.active)
  );

  // Memoize expensive computations
  const expensiveValue = derived(items, ($items) => {
    return $items.reduce((sum, item) => sum + item.value, 0);
  });
</script>
```

This comprehensive usage guide should help you effectively implement and customize the enhanced components in your RNT Mobile application.
