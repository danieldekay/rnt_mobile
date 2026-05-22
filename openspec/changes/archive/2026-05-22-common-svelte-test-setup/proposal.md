# Common Svelte Test Setup

## Why

The repo already runs Vitest and contains several Svelte component tests, but those tests duplicate ad hoc mounting helpers and do not share a common render/setup layer. A shared Svelte test setup is needed now so component and route-level tests can be written consistently, with less boilerplate and fewer false assumptions about how components mount in jsdom.

## What Changes

- Add a common Svelte test setup file for Vitest-based component tests.
- Define shared test utilities for rendering Svelte components and cleaning up DOM state between tests.
- Standardize how component tests access globals, matchers, and common mocks.
- Align existing Svelte component tests with the shared setup so new tests follow one pattern.
- Add or update npm test scripts only if needed to expose the shared setup cleanly.

## Capabilities

### New Capabilities

- `svelte-test-setup`: Provide a reusable common setup for Svelte component tests, including shared render helpers, cleanup behavior, and Vitest wiring.

### Modified Capabilities

- None.

## Impact

- Affected code: Vitest configuration, shared test utility files, and existing Svelte component test files under `src/lib/components`.
- Affected routes/views: no direct user-facing route change, but the setup supports safer coverage for component-heavy views such as the home list, calendar, and supporting content pages.
- APIs/data shape: no runtime API or data-shape changes.
- Prerender/Cloudflare Pages: no expected prerender or deployment impact because the change is limited to test infrastructure.
