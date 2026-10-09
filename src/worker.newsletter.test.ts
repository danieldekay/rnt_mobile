import { beforeEach, describe, expect, it, vi } from "vitest";
import worker from "../worker";

const ORIGIN = "https://rnt-mobile.test";

type Stored = Map<string, Response>;

function createCache() {
    const stored: Stored = new Map();

    return {
        stored,
        api: {
            match: vi.fn(async (request: Request) => {
                const hit = stored.get(request.url);
                return hit?.clone();
            }),
            put: vi.fn(async (request: Request, response: Response) => {
                stored.set(request.url, response.clone());
            }),
            delete: vi.fn(async (request: Request) => stored.delete(request.url)),
        },
    };
}

function createEnv(overrides: Record<string, unknown> = {}) {
    return {
        ASSETS: {
            fetch: vi.fn(async () => new Response("not-found", { status: 404 })),
        },
        SENDY_BASE_URL: "https://newsletter.example.test",
        SENDY_LIST_ID: { toString: () => "list-id" },
        SENDY_API_KEY: { toString: () => "api-key" },
        ...overrides,
    };
}

function post(path: string, body: Record<string, string>) {
    return new Request(`${ORIGIN}${path}`, {
        method: "POST",
        headers: {
            origin: ORIGIN,
            "content-type": "application/json",
        },
        body: JSON.stringify(body),
    });
}

describe("Worker newsletter hardening", () => {
    let cache: ReturnType<typeof createCache>;

    beforeEach(() => {
        vi.restoreAllMocks();
        cache = createCache();
        vi.stubGlobal("caches", { default: cache.api });
    });

    it("stores nonce with an explicit five-minute edge TTL and returns no-store", async () => {
        const response = await worker.fetch(
            new Request(`${ORIGIN}/api/newsletter/nonce`),
            createEnv(),
        );
        const body = (await response.json()) as { nonce: string };

        expect(response.status).toBe(200);
        expect(response.headers.get("cache-control")).toBe("no-store");
        expect(body.nonce).toBeTruthy();
        expect(cache.api.put).toHaveBeenCalledTimes(1);

        const storedResponse = Array.from(cache.stored.values())[0];
        expect(storedResponse.headers.get("cache-control")).toContain("s-maxage=300");
    });

    it("parses subscribe JSON exactly once and consumes the nonce", async () => {
        const nonceResponse = await worker.fetch(
            new Request(`${ORIGIN}/api/newsletter/nonce`),
            createEnv(),
        );
        const { nonce } = (await nonceResponse.json()) as { nonce: string };

        const upstream = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValueOnce(new Response("1", { status: 200 }));

        const response = await worker.fetch(
            post("/api/newsletter/subscribe", {
                email: "daniel@example.test",
                hp: "",
                nonce,
            }),
            createEnv(),
        );

        expect(response.status).toBe(200);
        expect(upstream).toHaveBeenCalledTimes(1);
        expect(cache.api.delete).toHaveBeenCalledTimes(1);
    });

    it("rejects nonce reuse", async () => {
        const nonceResponse = await worker.fetch(
            new Request(`${ORIGIN}/api/newsletter/nonce`),
            createEnv(),
        );
        const { nonce } = (await nonceResponse.json()) as { nonce: string };

        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("1", { status: 200 }));

        const first = await worker.fetch(
            post("/api/newsletter/unsubscribe", {
                email: "daniel@example.test",
                nonce,
            }),
            createEnv(),
        );
        const second = await worker.fetch(
            post("/api/newsletter/unsubscribe", {
                email: "daniel@example.test",
                nonce,
            }),
            createEnv(),
        );

        expect(first.status).toBe(200);
        expect(second.status).toBe(403);
    });

    it("uses the dedicated mutation limiter when configured", async () => {
        const limiter = {
            limit: vi.fn(async () => ({ success: false })),
        };

        const response = await worker.fetch(
            post("/api/newsletter/status", {
                email: "daniel@example.test",
            }),
            createEnv({ NEWSLETTER_MUTATION_RATE_LIMITER: limiter }),
        );

        expect(response.status).toBe(429);
        expect(response.headers.get("retry-after")).toBe("60");
        expect(limiter.limit).toHaveBeenCalledTimes(1);
    });
});
