# Capability: Privacy Consent

## Purpose

Describe how the app requests, stores, and reapplies consent for non-essential features so analytics and embedded maps stay disabled until the user explicitly allows them.

## Requirements

### Requirement: Collect consent before non-essential processing
The app SHALL request consent before enabling analytics or embedded maps and SHALL keep all non-essential processing disabled until the user makes an explicit choice.

#### Scenario: First visit without stored consent
- **WHEN** the user opens the app and no consent decision has been stored yet
- **THEN** the app shows a consent banner in clear German language
- **AND** explains the categories for essential storage, analytics, and maps
- **AND** keeps analytics disabled and embedded maps blocked until the user saves a choice

#### Scenario: Reject non-essential categories
- **WHEN** the user rejects analytics and maps from the banner or settings surface
- **THEN** the app stores that preference
- **AND** continues to work for event browsing and legal reading without analytics or embedded maps
- **AND** hides the initial banner after the decision is saved

### Requirement: Let users review and change consent at any time
The app SHALL provide a persistent way to reopen consent settings and SHALL apply changed consent choices to future app behavior.

#### Scenario: Open consent settings later
- **WHEN** the user opens consent settings from the app shell or a legal page after the initial decision
- **THEN** the app shows the current category choices
- **AND** lets the user change analytics and maps independently
- **AND** saves the updated choice without requiring a full page reload

#### Scenario: Withdraw previously granted consent
- **WHEN** the user disables a category that had previously been enabled
- **THEN** future processing for that category stops
- **AND** the app preserves essential navigation and event-browsing functions

### Requirement: Track analytics only after explicit analytics consent
The app SHALL initialize Matomo only after analytics consent exists and SHALL keep analytics requests off otherwise.

#### Scenario: Analytics consent granted
- **WHEN** the user enables analytics and valid Matomo configuration is available
- **THEN** the app initializes Matomo
- **AND** tracks subsequent SPA route views as analytics pageview events
- **AND** includes app version and current feature or route context in the permitted analytics payload

#### Scenario: Analytics consent absent or withdrawn
- **WHEN** analytics consent is absent, denied, or later withdrawn
- **THEN** the app does not initialize Matomo
- **AND** sends no Matomo tracking requests from that point forward

### Requirement: Keep analytics and map consent independent
The app SHALL let users enable maps without analytics and enable analytics without maps.

#### Scenario: Enable maps only
- **WHEN** the user grants maps consent but leaves analytics disabled
- **THEN** embedded maps become available in the app
- **AND** analytics remains disabled

#### Scenario: Enable analytics only
- **WHEN** the user grants analytics consent but leaves maps disabled
- **THEN** analytics becomes available
- **AND** embedded maps remain blocked until map consent is granted