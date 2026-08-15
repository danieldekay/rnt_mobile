---
type: Data Model
title: Data Models
description: TypeScript interfaces and types for events, venues, organizers, and the enhanced data layer.
tags: [typescript, types, interfaces, data-models]
sources:
  - id: inventory
    resource: /sources/INVENTORY.md
    title: RNT Mobile Project Inventory
  - id: api-docs
    resource: /sources/API_DOCUMENTATION.md
    title: API Documentation
  - id: component-usage
    resource: /sources/COMPONENT_USAGE.md
    title: Component Usage Guide
generated: { by: agent/copilot, at: 2026-07-25T21:10:00Z }
status: stable
---

# Data Models

Core TypeScript interfaces used throughout the application.

## TribeEvent

The primary event type from WordPress The Events Calendar:

```typescript
interface TribeEvent {
  id: number;
  title: string;
  description: string;
  excerpt: string;
  slug: string;
  url: string;
  image: string;
  all_day: boolean;
  start_date: string;
  end_date: string;
  start_date_details: DateDetails;
  end_date_details: DateDetails;
  timezone: string;
  timezone_abbr: string;
  cost: string;
  cost_details: CostDetails;
  categories: Category[];
  venue: Venue;
  organizer: Organizer;
  featured: boolean;
  sticky: boolean;
}
```

## DateDetails

```typescript
interface DateDetails {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}
```

## CostDetails

```typescript
interface CostDetails {
  currency_symbol: string;
  currency_position: string;
  values: string[];
}
```

## Venue

```typescript
interface Venue {
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
}
```

## Organizer

```typescript
interface Organizer {
  id: number;
  title: string;
  description?: string;
  featured_image?: string;
}
```

## EnhancedOrganizer

Extends base organizer with rich metadata for UI display:

```typescript
interface EnhancedOrganizer extends BaseOrganizer {
  created_at: string;
  updated_at: string;
  status: "publish" | "draft" | "pending";
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    spotify?: string;
    soundcloud?: string;
    website?: string;
  };
  media?: {
    logo?: string;
    banner?: string;
    gallery?: string[];
    avatar?: string;
  };
  stats?: {
    event_count: number;
    follower_count?: number;
    verification_status: "verified" | "pending" | "unverified";
    verification_level?: 1 | 2 | 3;
  };
  tags?: string[];
  keywords?: string[];
  categories?: string[];
  seo?: {
    meta_title?: string;
    meta_description?: string;
    focus_keywords?: string[];
  };
  related_organizers?: number[];
  featured_events?: number[];
}
```

## EnhancedVenue

```typescript
interface EnhancedVenue extends BaseVenue {
  venue_details?: {
    facilities?: string[];
    capacity?: number;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}
```

## Filter Types

```typescript
type EventType = 'milonga' | 'practica' | 'workshop' | 'kurs';
type MusicType = 'traditional' | '50neo' | 'neo';
type DateFilter = 'today' | '7days' | 'month' | 'all';

interface Filters {
  types: EventType[];
  music: MusicType[];
  date: DateFilter;
}
```

## Response Types

```typescript
interface EventsResponse {
  events: TribeEvent[];
  total: number;
  total_pages: number;
  next_rest_url?: string;
}
```

## Release Note Type

```typescript
interface ReleaseNote {
  version: string;
  date: string;
  highlights: string[];
}
```

## Cross-References

- [Event Lifecycle](/concepts/event-lifecycle.md) — how these models flow through the app
- [API Layer](/concepts/api-layer.md) — how models are fetched and normalized
- [Component System](/concepts/component-system.md) — how models render in components
