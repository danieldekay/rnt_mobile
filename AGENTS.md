# AGENTS.md

## Project Overview

SvelteKit 5 + Svelte 5 static PWA for displaying Rhein-Neckar-Tango events. Fetches from WordPress Events API.

## Commands

```bash
npm run dev      # Start dev server at localhost:5173
npm run build    # Build to ./build (static adapter)
npm run check   # svelte-kit sync + svelte-check
```

## Architecture

- **Routes**: `/` (event list + filtering), `/calendar` (calendar view)
- **Components**: `src/lib/components/*.svelte`
- **API**: `src/lib/api/tribe.ts` → fetches from `https://www.rhein-neckar-tango.de/wp-json/tribe/events/v1`
- **Store**: `src/lib/stores/events.svelte.ts`
- **Adapter**: `@sveltejs/adapter-static` with prerendering enabled (`handleHttpError: 'warn'`)

## TypeScript

Extends `.svelte-kit/tsconfig.json`. Uses Svelte 5 runes (`$state`, `$derived`, `$effect`). Svelte files use `<script lang="ts">`.

## Deployment

Deployed to Cloudflare Pages. Build output in `build/` directory. See `DEPLOY.md` for details.

## Testing

No test framework configured. Run `npm run check` for type checking.

## SpecFact

- `specfact.io` is set up for VS Code / GitHub Copilot in this repo.
- Prompt files live in `.github/prompts/` and are recommended through `.vscode/settings.json`.
- The current bootstrap used the `api-first-team` profile so SpecFact project, spec, and codebase workflows are available.
- For a fresh local re-sync of the repo integration, run `uvx specfact-cli@latest init --profile api-first-team` and `uvx specfact-cli@latest init ide --ide vscode --force` from the repo root.

### Usage Notes

- Use the installed Copilot slash prompts such as `/specfact.01-import`, `/specfact.02-plan`, `/specfact.05-enforce`, `/specfact.06-sync`, and `/specfact.validate` when you want SpecFact workflows.
- This repo remains OpenSpec-first for change authoring; SpecFact complements it for import, validation, and bridge workflows.
- OpenSpec project context is read from `openspec/config.yaml`, which SpecFact can consume during OpenSpec integration.
- For OpenSpec bridge sync in this repo, use the OpenSpec adapter, for example: `specfact project sync bridge --adapter openspec --mode read-only --bundle <bundle-name> --repo .`
