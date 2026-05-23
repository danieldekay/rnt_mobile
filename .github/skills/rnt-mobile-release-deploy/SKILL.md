---
name: rnt-mobile-release-deploy
description: Use when preparing, tagging, pushing, or deploying a release for the rnt_mobile repository, especially when package.json, src/lib/content/release-notes.ts, Git tags, and the Cloudflare Worker deployment must stay in sync.
---

# RNT Mobile Release And Deploy

## Overview

This skill is the repo-local checklist for cutting a user-facing release of rnt_mobile and sending it to production.
The release source of truth is the package version plus the top entry in src/lib/content/release-notes.ts.

## Use It For

- Patch, minor, or urgent bugfix releases of the mobile app
- Updating user-facing release notes before deployment
- Creating the Git tag that matches the shipped version
- Pushing a release that should trigger the GitHub Actions deploy workflow
- Manual fallback deploys with Wrangler when CI is unavailable

## Release Artifacts

Keep these aligned:

- package.json: version
- src/lib/content/release-notes.ts: top entry version, date, headline, summary, highlights
- Git tag: vX.Y.Z

__APP_VERSION__ is injected from vite.config.ts, so do not hardcode the version elsewhere.

## Standard Flow

1. Implement and verify the fix locally.
2. Update package.json to the new version.
3. Add or update the top release note entry in src/lib/content/release-notes.ts.
4. Make sure release notes are written for end users, not for developers.
5. Run the narrow relevant tests first, then run:

```bash
npm run check
npm run build
```

6. Review git status for unintended files.
7. Commit with a release-oriented message.
8. Create an annotated tag:

```bash
git tag -a vX.Y.Z -m "vX.Y.Z"
```

9. Push commit and tag together:

```bash
git push origin main --follow-tags
```

10. Confirm the GitHub Actions deploy workflow starts and completes.
11. Smoke test production.

## How To Write Release Notes

Write for someone using the app, not maintaining it.

Prefer:

- what changed for the user
- what problem is gone
- what is easier, faster, or clearer now

Avoid:

- internal refactors as the main point
- filenames, type names, or framework jargon
- implementation details unless they explain user impact

## Production Deploy

Default production path:

```bash
git push origin main --follow-tags
```

That push triggers .github/workflows/deploy.yml, which builds the app and runs Wrangler deploy for the Worker Assets service.

## Manual Fallback Deploy

Use only when GitHub Actions is unavailable:

```bash
npm run build
npx wrangler deploy --message "Manual deploy"
```

## Smoke Test After Deploy

Check at least:

- home page loads
- events list loads without API error
- /kalender loads
- one event detail page opens
- footer shows the expected app version
- /was-ist-neu shows the new release entry

## Common Mistakes

- Bumping package.json but forgetting src/lib/content/release-notes.ts
- Creating the tag before local verification passes
- Pushing main without --follow-tags
- Writing technical notes that do not explain the visible user impact
- Forgetting that production deploys from GitHub Actions, not from Cloudflare Pages
