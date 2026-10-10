# Entity Overview Delta Specification

## Requirement: Entity hubs share a compact event feed

DJ, organizer, and venue list routes SHALL consume the same compact entity-overview feed rather than independently downloading complete event records.

### Scenario: Entity overview requested
- **WHEN** `/api/entity-overview` is requested
- **THEN** events cover the current calendar month and following two calendar months
- **AND** only fields needed by entity aggregation are returned
- **AND** explicit coverage metadata is included.

## Requirement: Upstream work is bounded

### Scenario: Source contains many pages
- **WHEN** the Tribe source reports more than 10 pages
- **THEN** at most 10 pages are fetched
- **AND** `truncated` is true.

### Scenario: Source contains several pages
- **WHEN** page 1 reports additional pages within the budget
- **THEN** remaining pages may be fetched concurrently with bounded concurrency
- **AND** projected results retain source page order.

## Requirement: Incomplete coverage is visible

### Scenario: Overview truncates
- **WHEN** `truncated` is true
- **THEN** DJ, organizer, and venue hubs display a coverage warning
- **AND** the UI does not silently imply complete later-event counts.
