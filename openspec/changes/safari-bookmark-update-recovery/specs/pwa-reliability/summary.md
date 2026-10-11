# Summary

The Safari/bookmark update issue was caused by treating `/` as a cache-first app-shell asset. The fix makes all navigation network-first before any app-shell asset lookup and prevents `/` from being explicitly precached.
