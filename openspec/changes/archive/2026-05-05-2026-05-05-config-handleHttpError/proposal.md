## Why

`handleHttpError: 'warn'` in `svelte.config.js` prints a verbose warning to the build console whenever the build encounters an HTTP error (e.g., missing assets, unreachable API routes). Since this project is fully static and has no dynamic API routes, these warnings are noise — they add ~20 lines per fetch attempt to the build output, cluttering the terminal during development.

## What Changes

- Change `handleHttpError: 'warn'` to `handleHttpError: 'ignore'` in `svelte.config.js`.
- No behavioral change for the end user.

## Capabilities

### Modified Capabilities

- `visual-foundation`: Build output is cleaner (no stale HTTP warnings), improving developer velocity.

## Impact

- Affected file: `svelte.config.js` only.
- No WordPress API or data-shape changes.
- No deployment-model changes.
