## Implementation Status

> **All tasks implemented and verified.** See `tasks.md` for completion details.

## Files Changed

- `package.json` — added `test` and `test:run` scripts
- `package.json` — added `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/svelte` to `devDependencies`
- `vitest.config.ts` — new Vitest config using `sveltekit()` plugin, `jsdom` environment
- `src/lib/utils/html.test.ts` — skeleton test file with tests for sanitizeHtml, sanitizeText, and escapeHtml

## Decisions

1. **Selected `vitest`** over alternatives (Jest, Jest DOM) because it is the recommended test runner for SvelteKit projects, has zero-config setup, and includes an in-browser UI (`@vitest/ui`).
2. **`jsdom` as test environment** because DOMPurify depends on `window`/`document` and jsdom provides that API.
3. **Skeleton test in `src/lib/utils/`** mirrors existing utility file location and provides a runnable example test without requiring complex Svelte component setups.
4. **No `@testing-library/svelte` initially** — added as devDependency for future component tests but not exercised yet, keeping the first PR minimal.

## Notes

- Tests run in jsdom which provides `window`/`document` APIs needed by DOMPurify.
- Test glob pattern `src/**/*.{test,spec}.{js,ts}` allows future tests to coexist with existing source files.
