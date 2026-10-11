---
name: Safari/PWA release smoke checklist
about: Verify Safari, bookmark, installed PWA, cache headers, and recovery after a release
title: "Release smoke: <date> <commit>"
labels: [release, qa, pwa]
assignees: ''
---

## Release under test

- Commit SHA:
- PR(s):
- Deploy run:
- Production URL:
- Tester:
- Date/time:

## Preconditions

- [ ] Production deploy workflow completed successfully.
- [ ] Tested production origin, not local preview.
- [ ] Private browsing is used only as a control case.
- [ ] `/app-status` version/state captured before testing.

## Launch modes

- [ ] iPhone Safari normal tab.
- [ ] iPhone Safari bookmarked launch.
- [ ] iPhone Home Screen / installed PWA launch.
- [ ] iPhone Safari private tab control.
- [ ] Desktop Safari or Chrome comparison, when available.

## Core smoke path

For each launch mode:

- [ ] Open `/app-status` and record app version, service worker state, controller state, cache count, and URL.
- [ ] Open `/`.
- [ ] Event list loads.
- [ ] List view works.
- [ ] Calendar view works.
- [ ] Map view opens without breaking the app.
- [ ] Reload works.
- [ ] Close/reopen from the same launch mode works.
- [ ] `/recovery` is reachable.

## Update reliability path

- [ ] Previously opened device/browser profile receives current release.
- [ ] Safari normal tab does not remain on old shell.
- [ ] Bookmark does not remain on old shell.
- [ ] Installed PWA does not remain on old shell.
- [ ] Private browsing is not the only mode showing current release.
- [ ] If stale content appeared, `/recovery` fixed it.
- [ ] After recovery, close/reopen still shows current release.

## Header spot-check

- [ ] `/` has `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`.
- [ ] `/service-worker.js` has no-store cache headers.
- [ ] `/service-worker.js` has `Service-Worker-Allowed: /`.
- [ ] `/_app/version.json` has no-store cache headers.
- [ ] `/_app/immutable/*` has long-lived immutable caching.

## Result

- [ ] Pass.
- [ ] Fail.

## Notes / evidence

Add screenshots, `/app-status` output, browser/device details, and observed differences between normal Safari, bookmark/PWA, and private browsing.

Related checklist documentation: `docs/release-smoke-checklist.md`.
