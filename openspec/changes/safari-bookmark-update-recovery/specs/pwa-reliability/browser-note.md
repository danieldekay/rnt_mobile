# Browser note

Private browsing works because it starts without the persistent Service Worker and Cache API state. Safari/bookmark mode reuses that state, so stale shell bugs are visible there first.
