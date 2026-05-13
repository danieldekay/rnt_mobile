# Capability: Visual Foundation

## Purpose

Describe the semantic design foundation that keeps the app shell and primary RNT event flows readable, touch-friendly, and visually consistent.
## Requirements
### Requirement: Use a semantic visual token system across the app shell and primary views
The app SHALL use a semantic visual foundation for surfaces, text, borders, actions, and focus styles across the main event flows instead of route-specific decorative color treatments.

#### Scenario: Navigate between primary views
- **WHEN** the user moves between the app shell, the home event list, the calendar page, and the event detail page
- **THEN** those views use a consistent paper-and-card surface system, text hierarchy, border treatment, and action styling derived from shared semantic tokens

### Requirement: Use age-friendly typography and control sizing
The app SHALL use the approved body and display type system with control sizing appropriate for older, mobile-first users.

#### Scenario: Read and operate primary controls on mobile
- **WHEN** the user reads labels or taps primary controls such as buttons, chips, segmented filters, and day selectors on a phone
- **THEN** the interface uses highly legible body and display fonts
- **AND** the interactive controls provide targets of at least 48 by 48 pixels for primary touch actions

### Requirement: Preserve strong focus and selection affordances without color-only signaling
The app SHALL communicate focus, active selection, and interaction state with more than color alone.

#### Scenario: Navigate interactive controls with keyboard or touch
- **WHEN** the user focuses or activates a primary control
- **THEN** the interface shows a visible focus or active treatment using outline, border, fill, icon, or label changes
- **AND** the state remains understandable without relying on hue alone

### Requirement: Prefer restrained utility styling over decorative gradients and glass effects
The app SHALL prioritize readability and logistics over decorative visual effects in utility flows.

#### Scenario: View primary utility screens
- **WHEN** the user views the home list, calendar, or event detail screens
- **THEN** the interface uses flat or lightly elevated surfaces with strong contrast
- **AND** avoids decorative glass styling, low-contrast washes, or gradients that compete with event information

### Requirement: Design System Alignment
All components SHALL use the established Tailwind design tokens defined in `src/app.css` instead of arbitrary values.

#### Scenario: Visual Consistency Check
- **WHEN** a component defines a border radius or background color
- **THEN** it MUST use tokens like `rounded-control` or `bg-surface-subtle`
- **AND** no raw hex codes or non-standard Tailwind values (e.g., `rounded-[12px]`) are present in the component markup

### Requirement: Standardized Touch Targets
The app SHALL ensure all interactive elements follow a consistent sizing pattern suitable for mobile-first usage.

#### Scenario: Button Sizing
- **WHEN** any button or interactive chip is rendered
- **THEN** it SHALL have a minimum height of `48px` (or equivalent Tailwind classes) to ensure reliable touch interaction on mobile devices

