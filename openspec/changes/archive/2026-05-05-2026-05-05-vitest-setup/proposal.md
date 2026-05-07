## Why

The `rnt_mobile` project currently has zero automated tests. The `npm run check` command only runs Svelte type-checking via `svelte-check`. There is no test runner, no test configuration, and no test utilities. Adding Vitest scaffolding provides the infrastructure to write unit and component tests incrementally.

## What Changes

- Add `vitest` and `@vitest/ui` as devDependencies.
- Configure `vitest.config.ts` for SvelteKit (using `@sveltejs/kit/vite` as the base).
- Add `vitest` script to `package.json`.
- Add a `.gitignore` entry for `*.spec.ts` if not already present.
- Create a skeleton `src/lib/utils/html.test.ts` with a happy-path test for `sanitizeHtml`.

## Capabilities

### Added Capabilities

- `test-infrastructure`: Project has a runnable test suite (`npm run test`) with Vitest + SvelteKit adapter.

## Impact
- Adds ~3 devDependencies (vitest, @vitest/ui, @testing-library/svelte if used).
- No behavioral change to production code.
- No deployment-model changes.
