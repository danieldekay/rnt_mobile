# Root cause

The previous Service Worker allowed this ordering:

1. Bookmark opens `/`.
2. Service Worker sees `/` in `ASSETS`.
3. Service Worker returns cached `/` app shell before navigation fallback logic runs.
4. Old JavaScript boots again, so the update controls may never get a chance to run.

The hotfix reverses this: navigation requests are resolved before app-shell cache checks.
