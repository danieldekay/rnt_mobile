# Capability: matomo-enhanced

## MODIFIED Requirements

### Requirement: Page View Tracking

The app SHALL track page views with display-mode context for both the first consented in-app view and subsequent SPA navigations.

#### Scenario: Initial consented view is tracked

- **WHEN** analytics consent is active and Matomo initializes on a currently open route
- **THEN** Matomo receives a page view event with the current URL and title
- **AND** the current display mode SHALL be attached as a custom dimension

#### Scenario: Route change tracked

- **WHEN** the user navigates from one route to another
- **THEN** Matomo receives a page view event with the new URL and title
- **AND** the current display mode SHALL be attached as a custom dimension
