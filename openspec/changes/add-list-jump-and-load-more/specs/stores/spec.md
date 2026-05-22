# Spec Delta: stores

## ADDED Requirements

### Requirement: Event store can append the next chronological list range

The event store SHALL support appending a newly fetched chronological range to the current event list for the active session.

#### Scenario: Append a new range to the current session list

- **WHEN** the store receives events for the next chronological range of the current list context
- **THEN** it merges those events into `allEvents`
- **AND** updates the displayed `events` collection from the combined data set

#### Scenario: Duplicate events appear across adjacent ranges

- **WHEN** two adjacent ranges contain the same event identifier
- **THEN** the store keeps a single copy of that event in the combined session list
- **AND** preserves chronological ordering after the merge

### Requirement: Event store resets progressive state when list context changes

The event store SHALL reset appended-range metadata when the user switches to a different base list context.

#### Scenario: User changes the primary date filter

- **WHEN** the user switches away from the current home date preset
- **THEN** the store treats the next load as a fresh base list
- **AND** clears any prior next-range cursor or append state from the earlier list context

#### Scenario: User refreshes the current list

- **WHEN** the user triggers a full refresh for the current list context
- **THEN** the store reloads the base window
- **AND** resets prior appended-range metadata before any new progressive loading occurs

### Requirement: Event store distinguishes append loading from initial loading

The event store SHALL expose append-specific loading and error state so the UI can keep already loaded events visible while more results are requested.

#### Scenario: Next range is loading

- **WHEN** the store is appending the next chronological range
- **THEN** the store keeps the existing event list available to subscribers
- **AND** exposes append-specific loading state for footer-level feedback

#### Scenario: Next range load fails

- **WHEN** the append request fails
- **THEN** the store keeps the existing list data available
- **AND** exposes append-specific error state without replacing the original loaded results with a global error screen
