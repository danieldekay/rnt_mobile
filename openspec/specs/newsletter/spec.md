# newsletter Specification

## Purpose
TBD - created by archiving change newsletter-enhancement. Update Purpose after archive.
## Requirements
### Requirement: Matomo Integration

The app SHALL track newsletter interactions for analytics.

#### Scenario: Track newsletter events
- **WHEN** a user submits the signup form, checks status, or unsubscribes
- **THEN** a Matomo event SHALL be tracked with category `'newsletter'` and the corresponding action
- **AND** the current display mode SHALL be included in the tracking data

