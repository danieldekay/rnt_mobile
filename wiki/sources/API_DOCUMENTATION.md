# API Documentation

Enhanced Data Models

This document describes the enhanced data models and API endpoints for the RNT Mobile application's organizer and venue systems.

## Enhanced Organizer Data Model

### Overview

The `EnhancedOrganizer` interface extends the base organizer data with additional metadata for improved user experience and richer content display.

### Interface Definition

```typescript
interface EnhancedOrganizer {
  // Core organizer data (from WordPress)
  id: number;
  title: string;
  description?: string;
  featured_image?: string;
  slug: string;

  // Enhanced metadata
  created_at: string;
  updated_at: string;
  status: "publish" | "draft" | "pending";

  // Contact information
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };

  // Social media links
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    spotify?: string;
    soundcloud?: string;
    website?: string;
  };

  // Media assets
  media?: {
    logo?: string;
    banner?: string;
    gallery?: string[];
    avatar?: string;
  };

  // Statistics and verification
  stats?: {
    event_count: number;
    follower_count?: number;
    verification_status: "verified" | "pending" | "unverified";
    verification_level?: 1 | 2 | 3;
  };

  // Additional metadata
  tags?: string[];
  keywords?: string[];
  categories?: string[];
  website_url?: string;
  phone_number?: string;
  email_address?: string;

  // SEO and content
  seo?: {
    meta_title?: string;
    meta_description?: string;
    focus_keywords?: string[];
  };

  // Relationships
  related_organizers?: number[];
  featured_events?: number[];
}
```

### API Endpoints

#### Fetch Enhanced Organizers

```typescript
async function fetchEnhancedOrganizers(params?: {
  limit?: number;
  offset?: number;
  search?: string;
  category?: string;
  status?: string;
}): Promise<EnhancedOrganizer[]>;
```

**Description**: Retrieves organizer data with enhanced metadata from the WordPress API.

**Parameters:**

- `limit`: Maximum number of results (default: 20)
- `offset`: Number of results to skip (default: 0)
- `search`: Search term for filtering organizers
- `category`: Filter by category slug
- `status`: Filter by status ('publish', 'draft', 'pending')

**Returns:**

- Array of `EnhancedOrganizer` objects

**Example:**

```typescript
const organizers = await fetchEnhancedOrganizers({
  limit: 10,
  search: "tango",
  status: "publish",
});
```

#### Fetch Single Enhanced Organizer

```typescript
async function fetchEnhancedOrganizer(
  id: number,
): Promise<EnhancedOrganizer | null>;
```

**Description**: Retrieves a single organizer by ID with enhanced metadata.

**Parameters:**

- `id`: Organizer ID

**Returns:**

- `EnhancedOrganizer` object or `null` if not found

**Example:**

```typescript
const organizer = await fetchEnhancedOrganizer(123);
if (organizer) {
  console.log(organizer.title, organizer.stats?.event_count);
}
```

## Enhanced Venue Data Model

### Overview

The `EnhancedVenue` interface extends the base venue data with additional information for comprehensive venue display and user interaction.

### Interface Definition

```typescript
interface EnhancedVenue {
  // Core venue data (from WordPress)
  id: number;
  title: string;
  description?: string;
  featured_image?: string;
  slug: string;

  // Enhanced metadata
  created_at: string;
  updated_at: string;
  status: "publish" | "draft" | "pending";

  // Location details
  location?: {
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };

  // Contact information
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    phone_number?: string;
    email_address?: string;
    address?: string;
  };

  // Social media links
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
    google_maps?: string;
  };

  // Venue details
  venue_details?: {
    capacity?: number;
    type?: string;
    facilities?: string[];
    amenities?: string[];
    parking?: string;
    accessibility?: string;
    dress_code?: string;
    age_restriction?: string;
  };

  // Media assets
  media?: {
    logo?: string;
    banner?: string;
    gallery?: string[];
    floor_plan?: string;
    exterior?: string;
    interior?: string[];
  };

  // Operating hours
  hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };

  // Additional metadata
  tags?: string[];
  keywords?: string[];
  categories?: string[];
  website?: string;
  province?: string;
  zip?: string;

  // Statistics
  stats?: {
    event_count: number;
    average_rating?: number;
    review_count?: number;
  };

  // Relationships
  related_venues?: number[];
  upcoming_events?: number[];
  past_events?: number[];

  // SEO and content
  seo?: {
    meta_title?: string;
    meta_description?: string;
    focus_keywords?: string[];
  };

  // Verification status
  verification?: {
    status: "verified" | "pending" | "unverified";
    level?: 1 | 2 | 3;
    verified_by?: string;
    verified_at?: string;
  };
}
```

### API Endpoints

#### Fetch Enhanced Venues

```typescript
async function fetchEnhancedVenues(params?: {
  limit?: number;
  offset?: number;
  search?: string;
  city?: string;
  category?: string;
  status?: string;
  has_events?: boolean;
}): Promise<EnhancedVenue[]>;
```

**Description**: Retrieves venue data with enhanced metadata from the WordPress API.

**Parameters:**

- `limit`: Maximum number of results (default: 20)
- `offset`: Number of results to skip (default: 0)
- `search`: Search term for filtering venues
- `city`: Filter by city name
- `category`: Filter by category slug
- `status`: Filter by status ('publish', 'draft', 'pending')
- `has_events`: Filter venues that have events

**Returns:**

- Array of `EnhancedVenue` objects

**Example:**

```typescript
const venues = await fetchEnhancedVenues({
  limit: 15,
  city: "Mannheim",
  has_events: true,
});
```

#### Fetch Single Enhanced Venue

```typescript
async function fetchEnhancedVenue(id: number): Promise<EnhancedVenue | null>;
```

**Description**: Retrieves a single venue by ID with enhanced metadata.

**Parameters:**

- `id`: Venue ID

**Returns:**

- `EnhancedVenue` object or `null` if not found

**Example:**

```typescript
const venue = await fetchEnhancedVenue(456);
if (venue) {
  console.log(venue.title, venue.location?.city);
}
```

## Data Validation and Sanitization

### Validation Functions

#### Organizer Validation

```typescript
function validateOrganizer(data: any): ValidationResult<EnhancedOrganizer> {
  // Validates organizer data structure and types
  // Returns validation result with errors if any
}

function sanitizeOrganizer(data: any): EnhancedOrganizer {
  // Sanitizes and normalizes organizer data
  // Removes invalid data and formats properly
}
```

#### Venue Validation

```typescript
function validateVenue(data: any): ValidationResult<EnhancedVenue> {
  // Validates venue data structure and types
  // Returns validation result with errors if any
}

function sanitizeVenue(data: any): EnhancedVenue {
  // Sanitizes and normalizes venue data
  // Removes invalid data and formats properly
}
```

### URL Validation

```typescript
function validateUrl(url: string): boolean {
  // Validates URL format and protocols
  // Allows http, https, and relative URLs
}

function sanitizeUrl(url: string): string | null {
  // Sanitizes URL and returns null if invalid
  // Normalizes URL format
}
```

### Contact Information Validation

```typescript
function validatePhone(phone: string): boolean {
  // Validates phone number format
  // Supports international formats
}

function validateEmail(email: string): boolean {
  // Validates email format
  // Follows RFC standards
}

function sanitizeAddress(address: string): string {
  // Sanitizes address format
  // Removes extra whitespace and normalizes
}
```

## Error Handling

### API Error Types

```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: any,
  ) {
    super(message);
  }
}

class NetworkError extends Error {
  constructor(
    message: string,
    public originalError?: Error,
  ) {
    super(message);
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public errors: ValidationError[],
  ) {
    super(message);
  }
}
```

### Error Handling Utilities

```typescript
function handleApiError(error: unknown, fallback?: any): any {
  // Handles API errors gracefully
  // Returns fallback data if provided
  // Logs error for debugging
}

function createFallbackData(type: "organizer" | "venue"): any {
  // Creates fallback data structure
  // Used when API fails
}

function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> {
  // Retries failed operations with exponential backoff
}
```

## Caching System

### Cache Manager

```typescript
class CacheManager {
  constructor(options: {
    ttl?: number; // Time to live in milliseconds
    maxSize?: number; // Maximum number of items
    evictionPolicy?: "lru" | "fifo";
  });

  set(key: string, value: any, ttl?: number): void;
  get(key: string): any | undefined;
  delete(key: string): void;
  clear(): void;
  has(key: string): boolean;
  size(): number;
}
```

### Cache Usage Examples

```typescript
// Create cache instance
const cache = new CacheManager({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
});

// Cache organizers
const cacheKey = `organizers-${search}-${limit}`;
let organizers = cache.get(cacheKey);

if (!organizers) {
  organizers = await fetchEnhancedOrganizers({ search, limit });
  cache.set(cacheKey, organizers);
}

// Cache venues
const venueCacheKey = `venue-${id}`;
let venue = cache.get(venueCacheKey);

if (!venue) {
  venue = await fetchEnhancedVenue(id);
  cache.set(venueCacheKey, venue);
}
```

## Service Worker Integration

### Cache Management for PWA

```typescript
// Cache strategies for PWA
const CACHE_NAME = "rnt-mobile-v1";
const urlsToCache = [
  "/",
  "/styles/main.css",
  "/scripts/main.js",
  "/favicon.ico",
];

// Install service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

// Cache strategy
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});
```

## Rate Limiting

```typescript
class RateLimiter {
  constructor(
    private maxRequests: number,
    private windowMs: number
  );

  canMakeRequest(): boolean;
  waitIfNeeded(): Promise<void>;
  recordRequest(): void;
}

// Usage
const rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

if (rateLimiter.canMakeRequest()) {
  // Make API request
} else {
  await rateLimiter.waitIfNeeded();
  // Then make request
}
```

## Monitoring and Analytics

### Performance Tracking

```typescript
class PerformanceTracker {
  static trackApiCall(
    endpoint: string,
    duration: number,
    success: boolean,
  ): void;
  static trackRenderTime(component: string, duration: number): void;
  static trackError(error: Error, context: string): void;
}

// Usage
const startTime = performance.now();
const data = await fetchEnhancedOrganizers();
const duration = performance.now() - startTime;

PerformanceTracker.trackApiCall("/organizers", duration, true);
```

### Usage Analytics

```typescript
class Analytics {
  static trackOrganizerView(organizerId: number, organizerTitle: string): void;
  static trackVenueView(venueId: number, venueTitle: string): void;
  static trackSearchQuery(query: string, resultsCount: number): void;
  static trackUserInteraction(action: string, target: string): void;
}

// Usage
Analytics.trackOrganizerView(123, "Tango Club Mannheim");
```

## Security Considerations

### Input Sanitization

All user inputs are sanitized to prevent:

- **XSS Attacks**: HTML and script tag removal
- **SQL Injection**: Parameterized queries
- **Command Injection**: Input validation and sanitization
- **CSRF Protection**: Token-based authentication

### Data Privacy

- **PII Handling**: Proper masking of personal information
- **GDPR Compliance**: Data minimization and consent handling
- **Anonymization**: User data anonymization for analytics
- **Access Control**: Role-based access control for sensitive data

## Testing

### Unit Tests

```typescript
// Example test for organizer validation
describe("validateOrganizer", () => {
  it("should validate organizer data structure", () => {
    const validOrganizer = {
      id: 1,
      title: "Test Organizer",
      slug: "test-organizer",
      // ... required fields
    };

    const result = validateOrganizer(validOrganizer);
    expect(result.isValid).toBe(true);
  });

  it("should reject invalid organizer data", () => {
    const invalidOrganizer = {
      id: "invalid", // should be number
      title: "", // should not be empty
    };

    const result = validateOrganizer(invalidOrganizer);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
// Example test for API integration
describe("fetchEnhancedOrganizers", () => {
  it("should fetch organizers from API", async () => {
    const organizers = await fetchEnhancedOrganizers();
    expect(Array.isArray(organizers)).toBe(true);
    expect(organizers.length).toBeGreaterThan(0);

    // Validate structure
    const firstOrganizer = organizers[0];
    expect(firstOrganizer).toHaveProperty("id");
    expect(firstOrganizer).toHaveProperty("title");
    expect(firstOrganizer).toHaveProperty("slug");
  });
});
```

This comprehensive API documentation provides all the necessary information for working with the enhanced organizer and venue data structures in the RNT Mobile application.
