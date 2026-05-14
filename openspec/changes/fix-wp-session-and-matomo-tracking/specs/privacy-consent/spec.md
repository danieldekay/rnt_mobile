# Capability: Privacy Consent

## MODIFIED Requirements

### Requirement: Track analytics only after explicit analytics consent

The app SHALL initialize Matomo only after analytics consent exists and SHALL keep analytics requests off otherwise.

#### Scenario: Analytics consent granted

- **WHEN** the user enables analytics and valid Matomo configuration is available
- **THEN** the app initializes Matomo
- **AND** tracks the current in-app view immediately as a pageview event
- **AND** tracks subsequent SPA route views as analytics pageview events
- **AND** includes app version and current feature or route context in the permitted analytics payload

#### Scenario: Analytics consent absent or withdrawn

- **WHEN** analytics consent is absent, denied, or later withdrawn
- **THEN** the app does not initialize Matomo
- **AND** sends no Matomo tracking requests from that point forward
