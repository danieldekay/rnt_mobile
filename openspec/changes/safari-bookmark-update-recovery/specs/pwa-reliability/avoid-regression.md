# Avoid regression

Do not add `/` back into a cache-first exact URL match for app-shell assets. If root HTML should be available offline, use the navigation fallback path, not a cache-first shell path.
