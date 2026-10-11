# User recovery note

If a device is already stuck on the previous broken Service Worker, the user may need one manual recovery launch because the old Service Worker can still serve cached `/` before receiving the hotfix.

Recommended one-time recovery URL:

```text
/?appUpdate=manual
```

After that launch loads the hotfix, normal bookmark/PWA launches should use network-first navigation for `/`.
