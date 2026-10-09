export async function networkFirstNavigation(
    request: Request,
    cacheName: string,
    fetcher: typeof fetch = fetch,
    cacheStorage: CacheStorage = caches,
): Promise<Response> {
    try {
        const networkResponse = await fetcher(request);
        if (networkResponse.ok) {
            const cache = await cacheStorage.open(cacheName);
            await cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch {
        const cachedNavigation = await cacheStorage.match(request);
        if (cachedNavigation) return cachedNavigation;

        const offline = await cacheStorage.match("/offline");
        return (
            offline ??
            new Response("Offline", {
                status: 503,
                headers: { "content-type": "text/plain; charset=utf-8" },
            })
        );
    }
}
