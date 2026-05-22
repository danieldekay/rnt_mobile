# Common Svelte Test Setup Tasks

## 1. Capture the target test pattern

- [x] 1.1 Update representative component tests in `src/lib/components/Button.test.svelte` and `src/lib/components/Card.test.svelte` to expect a shared render/setup import instead of local ad hoc `setup()` helpers
- [x] 1.2 Add a focused component-test assertion that proves the shared helper passes props and starts from a clean DOM state between tests

## 2. Add shared Svelte test infrastructure

- [x] 2.1 Update `package.json` with any missing test-only dependencies and scripts needed for a shared Svelte component test setup
- [x] 2.2 Update `vitest.config.ts` to register the shared setup entrypoint for component tests
- [x] 2.3 Create a shared test setup file (for example under `src/test/`) that registers baseline matchers, cleanup hooks, and minimal browser-test defaults
- [x] 2.4 Create a shared Svelte render helper (for example under `src/test/`) that exposes one consistent component mounting contract for tests

## 3. Migrate existing duplicated component tests

- [x] 3.1 Replace duplicated local `setup()` helpers in `src/lib/components/Button.test.svelte`, `src/lib/components/Card.test.svelte`, and `src/lib/components/Heading.test.svelte` with the shared helper
- [x] 3.2 Replace duplicated local `setup()` helpers in `src/lib/components/Avatar.test.svelte`, `src/lib/components/Badge.test.svelte`, `src/lib/components/Divider.test.svelte`, and `src/lib/components/Text.test.svelte` with the shared helper
- [x] 3.3 Keep any test-specific mocks local to the test file while removing now-redundant shared boilerplate

## 4. Validate the new common setup

- [x] 4.1 Run the focused Vitest component test slice covering the migrated Svelte component tests
- [x] 4.2 Run `npm run check` to verify the shared test setup does not introduce SvelteKit or TypeScript regressions
