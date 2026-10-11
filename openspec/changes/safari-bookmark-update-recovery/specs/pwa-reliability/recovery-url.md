# Recovery URL

Use this only for clients already pinned by the previous Service Worker:

```text
/?appUpdate=manual
```

The query string makes the old cache-first exact `/` match fail, so the old Service Worker falls through to its navigation path and can fetch the new app shell.
