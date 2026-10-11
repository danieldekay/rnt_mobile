# Limitation

This hotfix cannot alter the code of a Service Worker already running on a device until Safari installs the new Service Worker. For clients stuck before the hotfix, use one cache-busted launch (`/?appUpdate=manual`) to escape the exact cached `/` entry.
