## Why

The current organizer and venue cards have inconsistent UI patterns and limited data display. Organizer cards lack the visual polish and functionality of DJ cards, while venue cards don't leverage the full WordPress REST API data available. This creates a disjointed user experience and misses opportunities to showcase rich event information.

## What Changes

- Redesign organizer cards to match the polished DJ card design with consistent styling, improved data display, and better visual hierarchy
- Redesign venue cards with enhanced information architecture and improved visual design
- Extend WordPress REST API integration to pull additional organizer and venue data (photos, descriptions, social links, etc.)
- Extract common UX patterns into reusable style tokens and components for consistency across the app
- Create a unified card component system that can be reused across different screens

## Capabilities

### New Capabilities

- enhanced-organizer-card: Redesigned organizer cards with improved UI/UX and additional data fields
- enhanced-venue-card: Enhanced venue cards with comprehensive information display
- wp-api-enhancement: Extended WordPress REST API integration for richer organizer and venue data
- design-tokens-system: Extracted common styling patterns into reusable design tokens and components

### Modified Capabilities

- No existing capabilities require requirement-level changes

## Impact

- **Affected code**: src/routes/veranstalter/, src/routes/tanzraeume/, src/lib/components/, src/lib/api/tribe.ts
- **API changes**: Enhanced tribe API endpoints to fetch additional organizer and venue metadata
- **Data shape**: Extended event data model to include richer organizer and venue information
- **Components**: New reusable card components and design tokens
- **Routes**: Enhanced organizer and venue list/detail pages with improved UI
- **Deployment**: No impact on static build compatibility or Cloudflare Pages deployment
