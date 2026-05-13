## Context

Current state: Organizer and venue cards use basic styling with inconsistent layouts. DJ cards have a polished design with proper button styling, visual hierarchy, and better information display. The WordPress REST API currently fetches basic event data but lacks comprehensive organizer and venue metadata.

## Goals / Non-Goals

**Goals:**

- Create consistent, polished card designs for organizers and venues matching DJ card quality
- Extend WordPress REST API to fetch additional organizer/venue data (photos, descriptions, social links, contact info)
- Build reusable design tokens and components for consistent UI across the app
- Maintain mobile-first responsive design and static build compatibility
- Follow existing Svelte 5 rune patterns and project architecture

**Non-Goals:**

- Backend API development (WordPress side)
- New page routes or navigation changes
- Authentication or user management features
- Performance optimization beyond what's needed for the new designs

## Decisions

**1. Unified Card Component Architecture**

- Create base `Card` component with consistent spacing, shadows, and typography
- Extend to `OrganizerCard` and `VenueCard` with specialized content
- Use Svelte 5 runes with proper reactive state management
- Implement consistent button styling with proper text labels

**2. Design Token System**

- Extract colors, typography, spacing, and breakpoints into tokens
- Create reusable CSS custom properties for consistent theming
- Build component variants using token-based styling
- Ensure dark/light mode compatibility

**3. WordPress API Enhancement Strategy**

- Extend existing `src/lib/api/tribe.ts` to fetch additional organizer/venue metadata
- Add TypeScript interfaces for extended data structures
- Implement proper error handling and data validation
- Cache strategies for improved performance

**4. Data Display Architecture**

- Prioritize most relevant information above the fold
- Use progressive disclosure for secondary details
- Implement consistent visual hierarchy with typography and spacing
- Add appropriate icons and visual indicators

## Risks / Trade-offs

**[Risk] WordPress API limitations** → Mitigation: Implement graceful degradation and fallback data for missing fields

**[Risk] Performance impact from additional API calls** → Mitigation: Implement proper caching and data fetching strategies

**[Risk] Design consistency across different screen sizes** → Mitigation: Comprehensive responsive testing and mobile-first approach

**[Risk] Breaking changes to existing data structures** → Mitigation: Maintain backward compatibility and gradual migration approach
