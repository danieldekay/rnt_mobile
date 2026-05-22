# Spec Delta: event-fetching-spec

## ADDED Requirements

### Requirement: Event fetching can request a bounded chronological continuation

The event fetching layer SHALL support requesting an explicit future date range for progressive list browsing without requiring the caller to re-fetch previously loaded ranges.

#### Scenario: Request the next bounded range

- **WHEN** the caller provides a start date and end date for the next chronological list window
- **THEN** the fetching layer requests only events inside that explicit range
- **AND** returns the normalized events for that range to the caller

#### Scenario: Existing loaded ranges are not implicitly re-fetched

- **WHEN** the caller requests the next chronological range after an already loaded list window
- **THEN** the fetching layer does not require a larger replacement request that includes the older range again

### Requirement: Progressive range requests preserve normal failure semantics

Bounded continuation requests SHALL report request failures clearly so the caller can keep existing list data visible and offer retry behavior.

#### Scenario: Range request fails

- **WHEN** the explicit next-range request fails
- **THEN** the caller receives a failure for that request
- **AND** can decide how to preserve already loaded events and show recovery UI
