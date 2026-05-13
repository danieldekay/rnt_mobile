# Apply Design Theme - Design

## Context

The design token system (colors, typography, spacing) and base components (Card, Button, Heading, Text, Badge, Avatar, Divider) have been created but not fully integrated into the existing application.

## Goals

- Apply design tokens to all existing components
- Ensure visual consistency across the app
- Maintain mobile-first responsive design
- Keep static build compatibility

## Decisions

**1. Component Migration Strategy**

- Migrate components in order of usage: EventCard → NewsletterSignup → PwaInstallButton → others
- Replace hardcoded values with design token CSS custom properties
- Use Button component variants instead of inline button styles

**2. CSS Migration**

- Replace hardcoded color values with --color-\* tokens
- Replace hardcoded spacing with --spacing-\* tokens
- Replace hardcoded typography with --text-_ and --font-_ tokens

**3. Component Integration**

- Use Card component for content containers
- Use Button component for all buttons
- Use Badge component for status indicators
- Use Typography components for all text

## Non-Goals

- New features or functionality
- Backend changes
- New page routes
