# Scenarios

## Safari bookmark launch

1. Open the app from a normal Safari bookmark at `/`.
2. Confirm the navigation request is not served by a cache-first `/` shell.
3. Confirm the current deployed app version loads.

## Existing stale client recovery

1. If the app still shows an old shell, open `/?appUpdate=manual` once.
2. Confirm the page loads from network rather than the old exact `/` cache entry.
3. Return to the normal bookmark and confirm it no longer remains pinned to the stale shell.
