# Verification

Automated checks:

- `service-worker-navigation-order.test.ts` verifies navigation handling appears before cache-first app-shell matching.
- `static-headers.test.ts` verifies no-store headers for root, HTML, Service Worker, and version metadata.

Manual check:

- A Safari bookmark to `/` should no longer be served through the cache-first app-shell path once this hotfix's Service Worker is installed.
