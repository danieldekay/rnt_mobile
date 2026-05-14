# Specification Delta: architecture

## MODIFIED Requirements

### Requirement: Modular Layered Architecture

The system SHALL follow a modular architecture with separation of concerns between API, state management, components, and routing layers.

#### Scenario: API layer isolation

- **WHEN** components require event data
- **THEN** they access it through the event store, not by calling API functions directly
- **AND** the API layer (`src/lib/api/tribe.ts`) handles external communication and normalization
- **AND** the store layer (`src/lib/stores/events.svelte.ts`) manages state and filtering logic

#### Scenario: State management separation

- **WHEN** multiple components need access to the same UI state
- **THEN** they subscribe to Svelte stores rather than deep prop drilling
- **AND** the event store centralizes event data, loading states, error states, and filter logic

#### Scenario: Route and worker separation

- **WHEN** worker endpoints evolve to support security, newsletter, and proxy behavior
- **THEN** endpoint concerns are implemented in focused modules composed by a single worker entrypoint
- **AND** routing order and behavior remain deterministic and testable

### Requirement: Data Flow Direction

The system SHALL maintain a clear, unidirectional data flow from external APIs to UI presentation.

#### Scenario: Error handling flow remains centralized

- **WHEN** an API request fails
- **THEN** errors propagate through API handling to store error state and then to user-visible error UI
- **AND** retry flows are initiated through store actions

#### Scenario: Security hardening is orthogonal to data flow

- **WHEN** security headers and request-authenticity checks are applied in the worker
- **THEN** store and component data-flow contracts remain unchanged

## ADDED Requirements

### Requirement: Worker response hardening is centralized

The worker SHALL apply security response policies through centralized middleware utilities rather than per-route ad hoc logic.

#### Scenario: New endpoint inherits baseline security

- **WHEN** a new worker route is added
- **THEN** baseline security headers are automatically applied without duplicating per-route header code
