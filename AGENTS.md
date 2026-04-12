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