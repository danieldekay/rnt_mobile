# Tasks

- [x] Stop treating `/` as a cache-first Service Worker asset.
- [x] Route navigation requests before app-shell asset cache handling.
- [x] Mark root and HTML entry documents as `no-store`.
- [x] Mark Service Worker and version metadata as `no-store, no-cache, must-revalidate`.
- [ ] Verify CI typecheck, tests, build, and Worker bundle validation.
- [ ] Merge and deploy hotfix.
- [ ] Smoke-test Safari/bookmark recovery with a cache-busted URL once, then normal bookmark launch.
