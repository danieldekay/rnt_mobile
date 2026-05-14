# Capability: wordpress-session-status

## ADDED Requirements

### Requirement: Sidebar reports WordPress admin session status accurately

The system SHALL determine WordPress admin authentication status using a session check that does not depend on REST nonce context and SHALL expose a stable status payload for the sidebar.

#### Scenario: Authenticated admin session is recognized

- **WHEN** `/api/wp-auth-status` receives a request with cookies for an active WordPress admin session
- **THEN** the response indicates `loggedIn: true`
- **AND** includes `available: true`, a success message, and a valid `adminUrl`

#### Scenario: Unauthenticated request is recognized

- **WHEN** `/api/wp-auth-status` receives a request without a valid WordPress admin session
- **THEN** the response indicates `loggedIn: false`
- **AND** includes `available: true` with a valid `loginUrl` and `adminUrl`

### Requirement: Status endpoint degrades gracefully on upstream failures

The system SHALL return an unavailable status response when WordPress status checks fail due to timeout or upstream errors.

#### Scenario: WordPress status check times out or fails

- **WHEN** the upstream WordPress check cannot complete successfully
- **THEN** `/api/wp-auth-status` returns `available: false`
- **AND** sets `loggedIn: false` with an actionable fallback message and login/admin URLs
