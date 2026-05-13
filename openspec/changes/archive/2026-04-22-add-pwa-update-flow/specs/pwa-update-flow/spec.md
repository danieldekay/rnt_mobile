## ADDED Requirements

### Requirement: Detect when a newer deployed app build is available
The app SHALL check whether a newer deployed build is available while the user is using the app, without interrupting normal browsing.

#### Scenario: App is already current
- **WHEN** the app checks for updates and the deployed build has not changed
- **THEN** the app keeps the current session active
- **AND** does not show an update prompt

#### Scenario: Newer build is detected during an active session
- **WHEN** the app checks for updates and detects that a newer deployed build is available
- **THEN** the app shows a mobile-readable update notice in the app shell
- **AND** explains that a newer version of the app is ready
- **AND** keeps event browsing available until the user chooses to refresh

### Requirement: Let the user update from inside the installed PWA
The app SHALL provide an explicit in-app action that lets the user move onto the newer build without needing to remove and reinstall the PWA.

#### Scenario: User refreshes into the new version
- **WHEN** an update is available and the user chooses the in-app update action
- **THEN** the app reloads into the newer build
- **AND** returns the user to the app experience without requiring a fresh installation flow

#### Scenario: User checks for updates manually
- **WHEN** the user opens the update controls and requests a manual update check
- **THEN** the app performs the check immediately
- **AND** reports whether the app is already current or whether a refresh is available

### Requirement: Provide recovery guidance for stale installed sessions
The app SHALL explain how to recover when an installed session still appears outdated after the user has refreshed.

#### Scenario: Update recovery guidance is needed
- **WHEN** the app has reported an available update or the user opens update help from the app shell
- **THEN** the app provides short, device-appropriate recovery guidance
- **AND** explains that the user can close and reopen the installed app or reload the site in the browser if the older view persists

#### Scenario: Update check fails
- **WHEN** the app cannot complete an update check because the version endpoint or network request fails
- **THEN** the app keeps the current session usable
- **AND** shows a non-blocking error or fallback message instead of breaking the main event flows