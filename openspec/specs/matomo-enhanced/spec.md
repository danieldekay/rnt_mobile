# matomo-enhanced Specification

## Purpose
TBD - created by archiving change matomo-enhanced-tracking. Update Purpose after archive.
## Requirements
### Requirement: Page View Tracking
The app SHALL enhance page view tracking to include display mode and custom dimensions for better PWA analytics.

#### Scenario: Route change tracked
- **WHEN** the user navigates from one route to another
- **THEN** Matomo receives a page view event with the new URL and title
- **AND** the current display mode SHALL be attached as a custom dimension

