import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchBoundedEventRange } from "./worker/bounded-events";

describe("bounded Worker event fetching", () => {
    beforeEach(() => vi.restoreAllMocks());

    it("fetches the bounded page set and reports truncation", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(
            async (input) => {
                const page = Number(new URL(String(input)).searchParams.get("page"));
                return Response.json({
                    events: [{ id: page }],
                    total_pages: 20,
                });
            },
        );

        const result = await fetchBoundedEventRange({
            eventsBaseUrl: "https://wp.test/events",
            start: new Date("2026-10-09T00:00:00"),
            end: new Date("2026-12-31T23:59:59"),
            maxPages: 5,
            concurrency: 4,
        });

        expect(result.pagesFetched).toBe(5);
        expect(result.totalPages).toBe(20);
        expect(result.truncated).toBe(true);
        expect(result.events).toHaveLength(5);
        expect(fetchSpy).toHaveBeenCalledTimes(5);
    });
});
