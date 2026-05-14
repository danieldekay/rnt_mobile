# Specification Delta: matomo-enhanced

## ADDED Requirements

### Requirement: Matomo implementation is modular and maintainable

Matomo integration SHALL be organized into focused modules separating initialization/configuration, event tracking, and error or offline queue behavior.

#### Scenario: Analytics concerns are separated by module

- **WHEN** analytics source files are inspected
- **THEN** initialization, tracking, and offline or error concerns are implemented in separate modules with clear boundaries

## MODIFIED Requirements

### Requirement: Page View Tracking

The app SHALL enhance page view tracking to include display mode and custom dimensions for better PWA analytics.

#### Scenario: Route change tracked

- **WHEN** the user navigates from one route to another
- **THEN** Matomo receives a page view event with the new URL and title
- **AND** the current display mode SHALL be attached as a custom dimension
