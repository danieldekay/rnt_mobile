const CACHEABLE_PUBLIC_API_PATHS = new Set([
    "/api/events",
    "/api/venues",
    "/api/organizers",
    "/api/dj-cpt",
    "/api/posts",
    "/api/announcements",
    "/api/links",
    "/api/offline-snapshot",
    "/api/entity-overview",
]);

export function isCacheablePublicApiRequest(
    method: string,
    pathname: string,
): boolean {
    if (method !== "GET") return false;
    if (CACHEABLE_PUBLIC_API_PATHS.has(pathname)) return true;
    return pathname.startsWith("/api/events/");
}
