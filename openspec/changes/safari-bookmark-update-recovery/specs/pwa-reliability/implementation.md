# Implementation

The Service Worker now checks this order:

1. same-origin guard
2. update metadata bypass
3. navigation network-first handling
4. API policy
5. cache-first app-shell assets
6. dynamic image/font cache-network handling

This makes HTML entry navigation impossible to satisfy through the cache-first app-shell path.
