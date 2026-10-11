# Rollback

Rollback risk is low because the change makes HTML navigation network-first, while preserving offline fallback via `networkFirstNavigation` and `/offline`.

Do not roll back to a Service Worker ordering where `ASSETS.includes(request.url)` runs before `request.mode === "navigate"`.
