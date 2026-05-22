# Common Svelte Test Setup Design

## Context

The current repo already uses Vitest with a jsdom environment, and several component tests exist under `src/lib/components`. Those tests currently duplicate a local `setup()` helper, instantiate components directly, and rely on assumptions such as `instance.element` rather than a shared testing contract. There is no common Vitest setup file, no shared render helper, and no central place for DOM cleanup, matcher registration, or default browser API mocks.

This change is cross-cutting because it touches the test runner configuration, shared test utilities, and multiple existing Svelte test files. It must preserve the current static SvelteKit architecture and avoid any impact on runtime routes or Cloudflare Pages deployment.

## Goals / Non-Goals

**Goals:**

- Provide one shared test setup entrypoint for Svelte component tests.
- Standardize component rendering through a reusable helper instead of ad hoc constructor code in each test file.
- Ensure DOM state, mocks, and matcher registration are reset consistently between tests.
- Make new component tests easier to write across `src/lib/components` and any later route-level component tests.

**Non-Goals:**

- Redesign the production component APIs.
- Introduce end-to-end testing or browser automation.
- Change user-facing routes, copy, styling, data fetching, or prerender behavior.
- Rewrite every existing test file in one step beyond what is needed to establish the shared pattern.

## Decisions

### Use a dedicated Vitest setup file

The test runner will load a shared setup file through Vitest configuration so globals, cleanup hooks, and default mocks are registered once.

Alternatives considered:

- Keep per-file setup logic: rejected because duplication is already visible and will grow with more component tests.
- Put all helpers directly into `vitest.config.ts`: rejected because config should point to setup behavior, not contain executable test lifecycle logic.

### Use shared render utilities based on Svelte testing conventions

The common test layer should expose a reusable render path for Svelte components rather than direct `new Component(...)` calls in each test. This keeps tests focused on assertions and aligns future tests with the same DOM contract.

Alternatives considered:

- Continue constructing components manually: rejected because it leaks internal mounting details into every test and encourages inconsistent patterns.
- Create bespoke helpers per component family: rejected because the problem is common infrastructure, not component-specific abstraction.

### Keep test infrastructure isolated from runtime code

Shared setup files and helpers should live in test-only locations and must not alter production modules or SvelteKit routing behavior.

Alternatives considered:

- Reuse runtime utility modules for test wiring: rejected because test concerns such as cleanup and mocks are not runtime responsibilities.

### Migrate representative component tests onto the shared path first

The first implementation step should convert the existing component tests that currently duplicate setup logic so the new pattern is proven immediately.

Alternatives considered:

- Land setup files without updating existing tests: rejected because the repo would still demonstrate the wrong testing pattern.

## Risks / Trade-offs

- Dependency footprint increases if a dedicated Svelte testing helper library is added -> Limit additions to the minimum libraries needed for shared rendering and matchers.
- Existing tests may depend on undocumented mounting behavior -> Update a representative set of component tests during rollout to catch mismatches early.
- Shared mocks can become too broad and hide test intent -> Keep default mocks minimal and allow test files to override them locally.

## Migration Plan

1. Add or finalize the Vitest setup entry in the existing test configuration.
2. Create shared test setup and render helper files.
3. Migrate the current duplicated Svelte component tests to the shared helper.
4. Run focused tests, then `npm run check` to confirm the test layer does not affect app typing.

Rollback strategy: remove the setup file wiring and shared helpers, then restore the previous per-file test setup pattern if the new approach proves incompatible.

## Open Questions

- Whether the repo should standardize on `@testing-library/svelte` alone or pair it with additional custom wrapper helpers.
- Whether route-level load or navigation mocking should be part of the first shared setup or deferred until a route test needs it.
