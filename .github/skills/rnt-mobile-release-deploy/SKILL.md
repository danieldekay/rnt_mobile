---
name: rnt-mobile-release-deploy
description: Use when preparing, tagging, pushing, or deploying a release for the rnt_mobile repository, especially when package.json, src/lib/content/release-notes.ts, Git tags, and the Cloudflare Worker deployment must stay in sync.
---

# RNT Mobile Release And Deploy

## Overview

This repo-local workflow cuts a user-facing release of `rnt_mobile` and verifies the Cloudflare Worker Assets deployment. Production deploys from a push to `main` through `.github/workflows/deploy.yml`.

## Use It For

- Patch, minor, or urgent bugfix releases of the mobile app
- Updating user-facing release notes before deployment
- Creating the Git tag that matches the shipped version
- Pushing a release that should trigger the GitHub Actions deploy workflow
- Manual fallback deploys with Wrangler when CI is unavailable

## Release Artifacts

Keep these aligned:

- package.json and package-lock.json: matching version, including the lockfile root package
- src/lib/content/release-notes.ts: top entry version, date, headline, summary, highlights
- Git tag: vX.Y.Z

__APP_VERSION__ is injected from vite.config.ts, so do not hardcode the version elsewhere.

## Standard Flow

1. Confirm the checkout is on `main`, inspect `git status`, and keep unrelated changes out of the release commit.
2. Implement the change. Add a regression test for the reported problem and run it before and after the fix.
3. Bump the requested semver component with `npm version minor --no-git-tag-version` (or `patch`/`major` as requested). This updates both package files without creating a tag. If editing versions manually, check both lockfile version fields.
4. Add the top entry in `src/lib/content/release-notes.ts` using the release date. Write for app users.
5. Run focused tests, then all tests and release checks:

```bash
npm run test:run
npm run check
npm run build
git diff --check
```

6. Compare the package and lockfile versions with the top release note. Review the diff and `git status`; stage only intended files.
7. Commit with a release-oriented message and create an annotated tag only after all checks pass:

```bash
git tag -a vX.Y.Z -m "vX.Y.Z"
```

8. Push the commit and tag together:

```bash
git push origin main --follow-tags
```

9. Find the `deploy.yml` run for the pushed commit with `gh run list --workflow deploy.yml --limit 5`; wait for it with `gh run watch <run-id> --exit-status`. A successful push alone does not confirm deployment.
10. Smoke test production, including the release's original reproducer. Report the commit, tag, workflow result, and live result.

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
npx wrangler@4.69.0 deploy --message "Manual deploy"
```

## Smoke Test After Deploy

Check at least:

- home page and events list load without API error
- /kalender loads
- one event detail page opens and the release's changed behavior is visible
- footer shows the expected app version
- /was-ist-neu shows the new release entry

For the 0.5.0 DJ fix, check `/event/141080`: the description names Alma Mia for this milonga and Andy for the next one. The current event must show Alma Mia and link to her DJ profile.

## Common Mistakes

- Bumping package.json but forgetting src/lib/content/release-notes.ts
- Forgetting package-lock.json or its root package version
- Creating the tag before local verification passes
- Pushing main without --follow-tags
- Treating a successful push as proof that the GitHub Actions deploy succeeded
- Skipping the reported event or interaction during the production smoke test
- Writing technical notes that do not explain the visible user impact
- Forgetting that production deploys from GitHub Actions, not from Cloudflare Pages
