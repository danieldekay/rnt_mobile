# Specification Delta: newsletter

## MODIFIED Requirements

### Requirement: Matomo Integration

The app SHALL track newsletter interactions for analytics.

#### Scenario: Track newsletter events

- **WHEN** a user submits the signup form, checks status, or unsubscribes
- **THEN** a Matomo event SHALL be tracked with category `'newsletter'` and the corresponding action
- **AND** the current display mode SHALL be included in the tracking data

## ADDED Requirements

### Requirement: Newsletter write operations require request authenticity

Newsletter subscribe and unsubscribe endpoints SHALL require valid request authenticity proof before forwarding to Sendy.

#### Scenario: Subscribe request without authenticity proof is denied

- **WHEN** a client submits a subscribe request without the configured authenticity proof
- **THEN** the worker returns an authorization error and does not call Sendy

#### Scenario: Unsubscribe request without authenticity proof is denied

- **WHEN** a client submits an unsubscribe request without the configured authenticity proof
- **THEN** the worker returns an authorization error and does not call Sendy

#### Scenario: Authenticated newsletter write request is processed

- **WHEN** a client submits subscribe or unsubscribe with valid authenticity proof and valid payload
- **THEN** the worker forwards the request to Sendy and returns a normalized outcome payload
