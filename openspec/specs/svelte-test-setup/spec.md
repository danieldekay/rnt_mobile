# svelte-test-setup Specification

## Purpose
TBD - created by archiving change common-svelte-test-setup. Update Purpose after archive.
## Requirements
### Requirement: Shared Svelte test runtime

The system SHALL provide a shared Vitest setup entrypoint for Svelte component tests so test lifecycle wiring, globals, and baseline browser-test behavior are configured consistently.

#### Scenario: Component test suite starts with shared setup

- **WHEN** a Svelte component test is executed in the repo
- **THEN** Vitest loads a common setup file before test assertions run
- **AND** the test runs in the configured jsdom-based browser-like environment

#### Scenario: Common setup registers baseline test behavior once

- **WHEN** multiple Svelte component test files run in the same suite
- **THEN** shared matchers, cleanup hooks, and baseline browser-test configuration are registered from one common source
- **AND** individual test files do not need to duplicate that wiring

### Requirement: Shared component render utilities

The system SHALL provide a reusable test helper for mounting Svelte components so component tests can follow one consistent render pattern.

#### Scenario: Component test uses the shared render helper

- **WHEN** a developer writes or updates a Svelte component test
- **THEN** the test can mount the component through the shared helper instead of bespoke constructor code
- **AND** the helper returns a stable DOM-oriented contract suitable for assertions

#### Scenario: Shared helper supports component props

- **WHEN** a component test renders a Svelte component with props
- **THEN** the shared helper passes those props into the mounted component
- **AND** the rendered output is available for assertions without extra boilerplate

### Requirement: Deterministic cleanup between component tests

The system SHALL reset DOM state and shared test-side effects between Svelte component tests so one test file does not pollute another.

#### Scenario: DOM is cleaned after each test

- **WHEN** a Svelte component test finishes
- **THEN** the shared setup clears mounted DOM state before the next test runs

#### Scenario: Shared setup does not hide local mocks

- **WHEN** an individual test file defines its own mock or override
- **THEN** the shared setup keeps only the baseline defaults
- **AND** the test file can still supply case-specific mocks explicitly

