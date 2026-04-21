## ADDED Requirements

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