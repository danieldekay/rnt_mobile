import { beforeEach, describe, expect, it, vi } from "vitest";
import worker from "../worker";

const ORIGIN = "https://rnt.test";
const FEED_URL =
    "https://www.rhein-neckar-tango.de/feed/linklibraryfeed?settingsset=1";

function createCache() {
    const stored = new Map<string, Response>();
    return {
        stored,
        api: {
            match: vi.fn(async (request: Request) => stored.get(request.url)?.clone()),
            put: vi.fn(async (request: Request, response: Response) => {
                stored.set(request.url, response.clone());
            }),
            delete: vi.fn(async (request: Request) => stored.delete(request.url)),
        },
    };
}

function createEnv() {
    return {
        ASSETS: {
            fetch: vi.fn(async () => new Response("not found", { status: 404 })),
        },
        SENDY_LIST_ID: { toString: () => "list-id" },
    };
}

describe("Worker RSS edge cache", () => {
    let cache: ReturnType<typeof createCache>;

    beforeEach(() => {
        vi.restoreAllMocks();
        cache = createCache();
        vi.stubGlobal("caches", { default: cache.api });
    });

    it("stores a successful feed and serves the next request from edge cache", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            new Response("<rss><channel /></rss>", {
                status: 200,
                headers: { "content-type": "application/rss+xml" },
            }),
        );

        const first = await worker.fetch(
            new Request(`${ORIGIN}/api/links`),
            createEnv(),
        );

        expect(first.status).toBe(200);
        expect(cache.api.put).toHaveBeenCalledTimes(1);
        expect(cache.stored.has(FEED_URL)).toBe(true);

        const second = await worker.fetch(
            new Request(`${ORIGIN}/api/links`),
            createEnv(),
        );

        expect(second.status).toBe(200);
        expect(await second.text()).toContain("<rss>");
        expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
});
