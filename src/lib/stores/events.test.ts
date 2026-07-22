import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TribeEvent } from "$lib/types";
import { EVENT_TYPE_SLUGS, MUSIC_SLUGS } from "$lib/constants";

const fetchAllEventsMock = vi.fn();
const fetchNextEventsRangeMock = vi.fn();
const trackFeatureEventMock = vi.fn();

vi.mock("$lib/api/tribe", () => ({
    fetchAllEvents: fetchAllEventsMock,
    fetchNextEventsRange: fetchNextEventsRangeMock,
    getDateRange: vi.fn((filter: string) => {
        if (filter === "week") {
            return {
                start: new Date(2026, 4, 1, 0, 0, 0, 0),
                end: new Date(2026, 4, 7, 23, 59, 59, 999),
            };
        }

        return {
            start: new Date(2026, 4, 1, 0, 0, 0, 0),
            end: new Date(2026, 4, 31, 23, 59, 59, 999),
        };
    }),
    getContinuationDateRange: vi.fn((currentRange: { end: Date }) => ({
        start: new Date(2026, 4, 8, 0, 0, 0, 0),
        end: new Date(2026, 4, 14, 23, 59, 59, 999),
    })),
    extractDjFromDescription: vi.fn(() => ""),
}));

vi.mock("$lib/matomo", () => ({
    trackFeatureEvent: trackFeatureEventMock,
}));

type EventStoreSnapshot = {
    events: TribeEvent[];
    allEvents: TribeEvent[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    filters: {
        types: string[];
        music: string | null;
        date: string;
    };
    appendLoading: boolean;
    appendError: string | null;
    canLoadMore: boolean;
};

function createEvent(id: number, startDate: string): TribeEvent {
    return {
        id,
        title: `Event ${id}`,
        description: "",
        excerpt: "",
        slug: `event-${id}`,
        url: `https://example.com/events/${id}`,
        image: false,
        all_day: false,
        start_date: startDate,
        end_date: startDate,
        start_date_details: {
            year: startDate.slice(0, 4),
            month: startDate.slice(5, 7),
            day: startDate.slice(8, 10),
            hour: "20",
            minutes: "00",
            seconds: "00",
        },
        end_date_details: {
            year: startDate.slice(0, 4),
            month: startDate.slice(5, 7),
            day: startDate.slice(8, 10),
            hour: "23",
            minutes: "00",
            seconds: "00",
        },
        timezone: "Europe/Berlin",
        timezone_abbr: "CEST",
        cost: "12",
        cost_details: {
            currency_symbol: "€",
            currency_code: "EUR",
            currency_position: "suffix",
            values: ["12"],
        },
        categories: [],
        venue: null,
        organizer: [],
        featured: false,
        sticky: false,
    };
}

function createCategory(id: number, slug: string, name: string) {
    return {
        id,
        slug,
        name,
        description: "",
        count: 1,
    };
}

async function loadStore() {
    const module = await import("./events.svelte");
    return module.eventStore;
}

describe("eventStore progressive browsing", () => {
    beforeEach(() => {
        vi.resetModules();
        fetchAllEventsMock.mockReset();
        fetchNextEventsRangeMock.mockReset();
        trackFeatureEventMock.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("appends the next range and deduplicates overlapping events", async () => {
        fetchAllEventsMock.mockResolvedValueOnce([
            createEvent(1, "2026-05-01 20:00:00"),
            createEvent(2, "2026-05-03 20:00:00"),
        ]);
        fetchNextEventsRangeMock.mockResolvedValueOnce([
            createEvent(2, "2026-05-03 20:00:00"),
            createEvent(3, "2026-05-08 20:00:00"),
        ]);

        const eventStore = await loadStore();
        let latest: EventStoreSnapshot | undefined;
        const unsubscribe = eventStore.subscribe((value: unknown) => {
            latest = value as EventStoreSnapshot;
        });

        await eventStore.loadEvents(true);
        await eventStore.loadNextRange();

        expect(latest?.allEvents.map((event) => event.id)).toEqual([1, 2, 3]);
        expect(latest?.events.map((event) => event.id)).toEqual([1, 2, 3]);
        expect(latest?.appendError).toBeNull();
        expect(latest?.appendLoading).toBe(false);
        expect(latest?.canLoadMore).toBe(true);

        unsubscribe();
    });

    it("keeps loaded events visible and exposes append-specific error state", async () => {
        fetchAllEventsMock.mockResolvedValueOnce([
            createEvent(1, "2026-05-01 20:00:00"),
        ]);
        fetchNextEventsRangeMock.mockRejectedValueOnce(new Error("append failed"));

        const eventStore = await loadStore();
        let latest: EventStoreSnapshot | undefined;
        const unsubscribe = eventStore.subscribe((value: unknown) => {
            latest = value as EventStoreSnapshot;
        });

        await eventStore.loadEvents(true);
        const appendPromise = eventStore.loadNextRange();

        expect(latest?.allEvents.map((event) => event.id)).toEqual([1]);
        expect(latest?.appendLoading).toBe(true);

        await appendPromise;

        expect(latest?.allEvents.map((event) => event.id)).toEqual([1]);
        expect(latest?.error).toBeNull();
        expect(latest?.appendError).toBe("append failed");
        expect(latest?.appendLoading).toBe(false);

        unsubscribe();
    });

    it("resets append state when the base list context changes", async () => {
        fetchAllEventsMock
            .mockResolvedValueOnce([createEvent(1, "2026-05-01 20:00:00")])
            .mockResolvedValueOnce([createEvent(4, "2026-05-15 20:00:00")]);
        fetchNextEventsRangeMock.mockRejectedValueOnce(new Error("append failed"));

        const eventStore = await loadStore();
        let latest: EventStoreSnapshot | undefined;
        const unsubscribe = eventStore.subscribe((value: unknown) => {
            latest = value as EventStoreSnapshot;
        });

        await eventStore.loadEvents(true);
        await eventStore.loadNextRange();

        expect(latest?.appendError).toBe("append failed");
        expect(latest?.canLoadMore).toBe(true);

        eventStore.setFilters({ date: "month" });
        await eventStore.loadEvents(true);

        expect(latest?.allEvents.map((event) => event.id)).toEqual([4]);
        expect(latest?.appendError).toBeNull();
        expect(latest?.appendLoading).toBe(false);
        expect(latest?.canLoadMore).toBe(false);

        unsubscribe();
    });

    it("filters visible events by selected type and music", async () => {
        const milongaTraditional = createEvent(1, "2026-05-01 20:00:00");
        milongaTraditional.categories = [
            createCategory(1, EVENT_TYPE_SLUGS.milonga, "Milonga"),
            createCategory(2, MUSIC_SLUGS.traditional, "Traditionell"),
        ];

        const mixedMilongaTraditional = createEvent(2, "2026-05-02 20:00:00");
        mixedMilongaTraditional.categories = [
            createCategory(3, EVENT_TYPE_SLUGS.practica, "Practica"),
            createCategory(4, EVENT_TYPE_SLUGS.milonga, "Milonga"),
            createCategory(5, MUSIC_SLUGS.traditional, "Traditionell"),
        ];

        const workshopNeo = createEvent(3, "2026-05-03 20:00:00");
        workshopNeo.categories = [
            createCategory(6, EVENT_TYPE_SLUGS.workshop, "Workshop"),
            createCategory(7, MUSIC_SLUGS.neo, "Neo"),
        ];

        fetchAllEventsMock.mockResolvedValueOnce([
            milongaTraditional,
            mixedMilongaTraditional,
            workshopNeo,
        ]);

        const eventStore = await loadStore();
        let latest: EventStoreSnapshot | undefined;
        const unsubscribe = eventStore.subscribe((value: unknown) => {
            latest = value as EventStoreSnapshot;
        });

        await eventStore.loadEvents(true);
        eventStore.toggleType("milonga");

        expect(latest?.events.map((event) => event.id)).toEqual([1, 2]);

        eventStore.toggleType("milonga");
        eventStore.toggleType("practica");

        expect(latest?.events).toEqual([]);

        eventStore.toggleType("practica");
        eventStore.toggleMusic("traditional");

        expect(latest?.events.map((event) => event.id)).toEqual([1, 2]);

        eventStore.toggleMusic("traditional");
        eventStore.toggleType("workshop");
        eventStore.toggleMusic("neo");

        expect(latest?.events.map((event) => event.id)).toEqual([3]);

        unsubscribe();
    });
});