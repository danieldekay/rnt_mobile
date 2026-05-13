# Setup Vitest Test Infrastructure

### Requirement: Vitest test runner installed and configured

- [x] 1.1 Add `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/svelte` to `devDependencies`
- [x] 1.2 Add `"test": "vitest"` and `"test:run": "vitest run"` scripts to `package.json`
- [x] 1.3 Create `vitest.config.ts` with `sveltekit()` plugin, `jsdom` environment, and `src/**` test glob
- [x] 1.4 Create `src/lib/utils/html.test.ts` skeleton with 1 passing test for `sanitizeHtml`

## COMPLETED Requirements

- [x] 2.1 Run `npm run test:run` — exactly one test passes
