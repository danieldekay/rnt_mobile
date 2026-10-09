import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleEntityOverview } from "./worker/entity-overview";

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

describe("entity overview Worker feed", () => {
    let cache: ReturnType<typeof createCache>;

    beforeEach(() => {
        vi.restoreAllMocks();
        cache = createCache();
        vi.stubGlobal("caches", { default: cache.api });
    });

    it("projects full Tribe events to compact records and edge-caches the result", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            Response.json({
                total_pages: 1,
                events: [{
                    id: 7,
                    title: "Milonga",
                    description: "<p>DJ: Alma Mia</p>",
                    excerpt: "",
                    slug: "milonga",
                    url: "https://wp.test/event/7",
                    image: { url: "https://img.test/7.jpg" },
                    all_day: false,
                    start_date: "2026-10-10 20:00:00",
                    end_date: "2026-10-11 01:00:00",
                    categories: [{ id: 1, name: "Milonga", slug: "milonga", description: "large" }],
                    venue: { id: 4, venue: "Saal", city: "Mannheim", address: "unused" },
                    organizer: [{ id: 3, organizer: "RNT", email: "unused@example.test" }],
                    json_ld: { huge: "unused" },
                    cost_details: { values: ["unused"] },
                }],
            }),
        );

        const request = new Request("https://rnt.test/api/entity-overview");
        const first = await handleEntityOverview(request, {
            eventsBaseUrl: "https://wp.test/events",
        });
        const body = await first.json() as {
            events: Array<Record<string, unknown>>;
            truncated: boolean;
        };

        expect(body.truncated).toBe(false);
        expect(body.events).toHaveLength(1);
        expect(body.events[0]).not.toHaveProperty("json_ld");
        expect(body.events[0]).not.toHaveProperty("cost_details");
        expect(cache.api.put).toHaveBeenCalledTimes(1);

        const second = await handleEntityOverview(request, {
            eventsBaseUrl: "https://wp.test/events",
        });
        expect(second.status).toBe(200);
        expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
});
