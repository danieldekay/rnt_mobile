import { describe, expect, it, vi } from "vitest";
import { networkFirstNavigation } from "./navigation-fallback";

function createCacheStorage(entries: Record<string, Response> = {}) {
    const store = new Map<string, Response>(Object.entries(entries));
    const cache = {
        put: vi.fn(async (request: Request, response: Response) => {
            store.set(request.url, response.clone());
        }),
    };

    return {
        open: vi.fn(async () => cache),
        match: vi.fn(async (request: Request | string) => {
            const key = typeof request === "string" ? request : request.url;
            return store.get(key)?.clone();
        }),
    } as unknown as CacheStorage;
}

describe("navigation offline fallback", () => {
    it("returns the dedicated offline page when network and exact cache miss", async () => {
        const request = new Request("https://rnt.test/veranstalter");
        const caches = createCacheStorage({
            "/offline": new Response("offline-page", { status: 200 }),
        });
        const fetcher = vi.fn(async () => {
            throw new TypeError("offline");
        });

        const response = await networkFirstNavigation(
            request,
            "test-cache",
            fetcher as typeof fetch,
            caches,
        );

        expect(await response.text()).toBe("offline-page");
    });

    it("prefers an exact cached navigation before the offline page", async () => {
        const request = new Request("https://rnt.test/kalender");
        const caches = createCacheStorage({
            [request.url]: new Response("cached-calendar", { status: 200 }),
            "/offline": new Response("offline-page", { status: 200 }),
        });

        const response = await networkFirstNavigation(
            request,
            "test-cache",
            vi.fn(async () => {
                throw new TypeError("offline");
            }) as typeof fetch,
            caches,
        );

        expect(await response.text()).toBe("cached-calendar");
    });
});
