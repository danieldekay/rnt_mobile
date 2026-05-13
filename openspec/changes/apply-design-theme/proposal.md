# Apply Design Theme

## What & Why

The design token system and base components have been created, but they haven't been fully applied across the application. This change aims to:

- Apply design tokens to existing components that currently use hardcoded styles
- Migrate existing UI components to use the new design token system
- Ensure consistent visual design across all pages
- Replace hardcoded color values, spacing, and typography with design tokens

## What Changes

- Update existing components (EventCard, NewsletterSignup, PwaInstallButton, etc.) to use design tokens
- Migrate inline styles and hardcoded classes to CSS custom properties
- Apply consistent card styling using the Card component
- Update button styling across all pages to use Button component variants
- Ensure responsive design consistency

## Impact

- **Affected code**: src/lib/components/, src/routes/
- **No API changes**: Pure frontend styling changes
- **Build compatible**: Static build remains compatible
