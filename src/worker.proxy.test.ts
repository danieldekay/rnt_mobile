import { beforeEach, describe, expect, it, vi } from "vitest";
import { proxyJsonGet } from "./worker/proxy";

function createCache() {
    const stored = new Map<string, Response>();
    return {
        stored,
        api: {
            match: vi.fn(async (request: Request) => stored.get(request.url)?.clone()),
            put: vi.fn(async (request: Request, response: Response) => {
                stored.set(request.url, response.clone());
            }),
        },
    };
}

describe("Worker public JSON proxy", () => {
    let cache: ReturnType<typeof createCache>;

    beforeEach(() => {
        vi.restoreAllMocks();
        cache = createCache();
        vi.stubGlobal("caches", { default: cache.api });
    });

    it("forwards query parameters and stores successful cached responses", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            Response.json({ events: [] }, { status: 200 }),
        );

        const response = await proxyJsonGet(
            new Request("https://rnt.test/api/events?page=2&per_page=50"),
            "https://wp.test/events",
            { cacheTtlSeconds: 300 },
        );

        expect(response.status).toBe(200);
        expect(fetchSpy).toHaveBeenCalledWith(
            "https://wp.test/events?page=2&per_page=50",
            expect.objectContaining({ method: "GET" }),
        );
        expect(cache.api.put).toHaveBeenCalledTimes(1);
        expect(response.headers.get("cache-control")).toContain("s-maxage=300");
    });

    it("serves an edge-cache hit without an upstream request", async () => {
        cache.stored.set(
            "https://wp.test/events?page=1",
            Response.json({ events: [{ id: 1 }] }),
        );
        const fetchSpy = vi.spyOn(globalThis, "fetch");

        const response = await proxyJsonGet(
            new Request("https://rnt.test/api/events?page=1"),
            "https://wp.test/events",
            { cacheTtlSeconds: 300 },
        );

        expect(fetchSpy).not.toHaveBeenCalled();
        expect(await response.json()).toEqual({ events: [{ id: 1 }] });
    });

    it("rejects non-GET methods", async () => {
        const response = await proxyJsonGet(
            new Request("https://rnt.test/api/events", { method: "POST" }),
            "https://wp.test/events",
        );

        expect(response.status).toBe(405);
    });
});
