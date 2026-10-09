import { describe, expect, it, vi } from "vitest";
import { fetchAllEvents } from "./events";

const event = {
    id: 1,
    title: "Test",
    description: "",
    excerpt: "",
    slug: "test",
    url: "https://example.test/event/1",
    image: false,
    all_day: false,
    start_date: "2026-10-10 20:00:00",
    end_date: "2026-10-10 23:00:00",
    start_date_details: {
        year: "2026",
        month: "10",
        day: "10",
        hour: "20",
        minutes: "00",
        seconds: "00",
    },
    end_date_details: {
        year: "2026",
        month: "10",
        day: "10",
        hour: "23",
        minutes: "00",
        seconds: "00",
    },
    timezone: "Europe/Berlin",
    timezone_abbr: "CEST",
    cost: "",
    cost_details: {
        currency_symbol: "€",
        currency_code: "EUR",
        currency_position: "suffix",
        values: [],
    },
    categories: [],
    venue: null,
    organizer: [],
    featured: false,
    sticky: false,
};

describe("fetchAllEvents pagination bound", () => {
    it("never fetches more than ten pages", async () => {
        const fetcher = vi.fn(async () =>
            Response.json({
                events: [event],
                total: 100,
                total_pages: 100,
                rest_url: "/api/events",
                next_rest_url: "/api/events?page=2",
            }),
        );

        const events = await fetchAllEvents(
            [],
            null,
            "all",
            fetcher as typeof fetch,
            "https://example.test/api/events",
        );

        expect(fetcher).toHaveBeenCalledTimes(10);
        expect(events).toHaveLength(10);
    });
});
