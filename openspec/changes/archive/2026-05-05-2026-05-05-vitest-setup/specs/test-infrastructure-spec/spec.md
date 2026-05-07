# test-infrastructure-spec

## Capability: Test Infrastructure

### Description
The project MUST ship with a working Vitest test runner, enabling incremental test addition.

### Requirements

#### REQ-1: Test runner installed
- `vitest` and `@vitest/ui` MUST be listed in `devDependencies`.
- `npm run test` MUST start Vitest in watch mode.
- `npm run test:run` MUST execute tests and exit with code 0/1.

#### REQ-2: Vitest configuration
- `vitest.config.ts` MUST exist at project root.
- It MUST use `sveltekit()` plugin, `jsdom` environment, and `globals: true`.
- Test files MUST match glob `src/**/*.{test,spec}.{js,ts}`.

#### REQ-3: Skeleton test passes
- `src/lib/utils/html.test.ts` MUST contain at least one passing test
   that imports and runs `sanitizeHtml('')` returning a truthy string.

#### REQ-4: No prod dependency pollution
- All new packages MUST stay under `devDependencies`.
- No `dependencies` bumps.
