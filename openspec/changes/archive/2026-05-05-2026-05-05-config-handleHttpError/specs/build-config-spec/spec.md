# build-config-spec

## Capability: Build Config Cleanup

### Description
The SvelteKit build config MUST suppress `handleHttpError` warnings via `'ignore'` instead of `'warn'`.
Since the project is fully static with no dynamic API routes, these warnings are build noise only.

### Requirements

#### REQ-1: Warning suppression applied
- `kit.prerender.handleHttpError` MUST be `'ignore'` in `svelte.config.js`.
- The value `'warn'` MUST NOT appear anywhere in the config file.

#### REQ-2: Build output is clean
- Running `npm run build` MUST NOT output any warning prefixed with
  `handleHttpError` or similar HTTP fetch-related warnings.
- The static build MUST still produce a valid `build/` directory.

#### REQ-3: No behavioral regression
- All existing routes and static pages MUST render identically after the change.
