import { describe, expect, it, vi } from "vitest";
import { fetchEntityOverview } from "./entity-overview";

describe("entity overview API client", () => {
    it("inflates compact records for existing entity aggregation utilities", async () => {
        const fetcher = vi.fn(async () =>
            Response.json({
                generated_at: "2026-10-09T10:00:00Z",
                range_start: "2026-10-09T00:00:00Z",
                range_end: "2026-12-31T23:59:59Z",
                pages_fetched: 3,
                total_pages: 3,
                truncated: false,
                events: [{
                    id: 7,
                    title: "Milonga",
                    description: "<p>DJ: Alma Mia</p>",
                    excerpt: "",
                    slug: "milonga",
                    url: "https://wp.test/event/7",
                    image: false,
                    all_day: false,
                    start_date: "2026-10-10 20:00:00",
                    end_date: "2026-10-11 01:00:00",
                    categories: [{ id: 1, name: "Milonga", slug: "milonga" }],
                    venue: { id: 4, venue: "Saal", city: "Mannheim" },
                    organizer: [{ id: 3, organizer: "RNT" }],
                }],
            }),
        );

        const result = await fetchEntityOverview(fetcher as typeof fetch);

        expect(result.coverage.pagesFetched).toBe(3);
        expect(result.coverage.truncated).toBe(false);
        expect(result.events[0].venue?.city).toBe("Mannheim");
        expect(result.events[0].organizer[0].id).toBe(3);
        expect(result.events[0].categories[0].slug).toBe("milonga");
        expect(result.events[0].start_date_details.year).toBe("2026");
    });
});
