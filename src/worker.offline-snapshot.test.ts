import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleOfflineSnapshot } from "./worker/offline-snapshot";

describe("offline snapshot worker", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("aggregates the bounded event window and marks the response cacheable", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch");
        fetchSpy
            .mockResolvedValueOnce(
                Response.json({
                    events: [{ id: 1 }],
                    total_pages: 2,
                }),
            )
            .mockResolvedValueOnce(
                Response.json({
                    events: [{ id: 2 }],
                    total_pages: 2,
                }),
            );

        const response = await handleOfflineSnapshot(
            new Request("https://rnt.test/api/offline-snapshot"),
            {
                eventsBaseUrl: "https://wp.test/events",
                maxPages: 10,
                days: 30,
            },
        );
        const body = (await response.json()) as {
            ok: boolean;
            events: Array<{ id: number }>;
            truncated: boolean;
        };

        expect(response.status).toBe(200);
        expect(response.headers.get("cache-control")).toContain("s-maxage=300");
        expect(body.ok).toBe(true);
        expect(body.events.map((event) => event.id)).toEqual([1, 2]);
        expect(body.truncated).toBe(false);
        expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it("caps pagination and reports truncation", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            Response.json({
                events: [{ id: 1 }],
                total_pages: 99,
            }),
        );

        const response = await handleOfflineSnapshot(
            new Request("https://rnt.test/api/offline-snapshot"),
            {
                eventsBaseUrl: "https://wp.test/events",
                maxPages: 3,
            },
        );
        const body = (await response.json()) as {
            truncated: boolean;
            events: unknown[];
        };

        expect(body.truncated).toBe(true);
        expect(body.events).toHaveLength(3);
        expect(globalThis.fetch).toHaveBeenCalledTimes(3);
    });
});
