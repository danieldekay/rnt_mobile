import { fetchBoundedEventRange } from "./bounded-events";

type CacheStorageWithDefault = CacheStorage & {
    default: Cache;
};

type JsonRecord = Record<string, unknown>;

export type EntityOverviewOptions = {
    eventsBaseUrl: string;
    timeoutMs?: number;
    maxPages?: number;
    cacheTtlSeconds?: number;
};

function asRecord(value: unknown): JsonRecord | null {
    return value && typeof value === "object"
        ? (value as JsonRecord)
        : null;
}

function asString(value: unknown): string {
    return typeof value === "string" ? value : "";
}

function asNumber(value: unknown): number {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function projectCategory(value: unknown) {
    const category = asRecord(value);
    if (!category) return null;

    return {
        id: asNumber(category.id),
        name: asString(category.name),
        slug: asString(category.slug),
    };
}

function projectVenue(value: unknown) {
    const venue = asRecord(value);
    if (!venue) return null;

    const id = asNumber(venue.id);
    if (id <= 0) return null;

    return {
        id,
        venue: asString(venue.venue),
        city: asString(venue.city),
    };
}

function projectOrganizer(value: unknown) {
    const organizer = asRecord(value);
    if (!organizer) return null;

    const id = asNumber(organizer.id);
    if (id <= 0) return null;

    return {
        id,
        organizer: asString(organizer.organizer),
    };
}

function projectEvent(value: unknown) {
    const event = asRecord(value);
    if (!event) return null;

    const id = asNumber(event.id);
    const startDate = asString(event.start_date);
    if (id <= 0 || !startDate) return null;

    const categories = Array.isArray(event.categories)
        ? event.categories
              .map(projectCategory)
              .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
        : [];
    const organizers = Array.isArray(event.organizer)
        ? event.organizer
              .map(projectOrganizer)
              .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
        : [];

    return {
        id,
        title: asString(event.title),
        description: asString(event.description),
        excerpt: asString(event.excerpt),
        slug: asString(event.slug),
        url: asString(event.url),
        image: event.image ?? false,
        all_day: event.all_day === true,
        start_date: startDate,
        end_date: asString(event.end_date),
        categories,
        venue: projectVenue(event.venue),
        organizer: organizers,
    };
}

function getDefaultCache(): Cache {
    return (caches as CacheStorageWithDefault).default;
}

function getEntityRange(): { start: Date; end: Date } {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    // Covers the current calendar month plus the following two months so the
    // existing "Nächste 3 Monate" entity filter remains semantically complete.
    const end = new Date(
        start.getFullYear(),
        start.getMonth() + 3,
        0,
        23,
        59,
        59,
        999,
    );

    return { start, end };
}

export async function handleEntityOverview(
    request: Request,
    options: EntityOverviewOptions,
): Promise<Response> {
    if (request.method !== "GET") {
        return Response.json(
            { ok: false, message: "Methode nicht erlaubt." },
            { status: 405, headers: { "cache-control": "no-store" } },
        );
    }

    const cacheTtlSeconds = options.cacheTtlSeconds ?? 300;
    const cache = getDefaultCache();
    const cacheKey = new Request(request.url);

    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const { start, end } = getEntityRange();

    try {
        const result = await fetchBoundedEventRange({
            eventsBaseUrl: options.eventsBaseUrl,
            start,
            end,
            timeoutMs: options.timeoutMs,
            maxPages: options.maxPages ?? 10,
            concurrency: 4,
        });

        const events = result.events
            .map(projectEvent)
            .filter((event): event is NonNullable<typeof event> => event !== null);

        const response = Response.json(
            {
                ok: true,
                generated_at: new Date().toISOString(),
                range_start: start.toISOString(),
                range_end: end.toISOString(),
                pages_fetched: result.pagesFetched,
                total_pages: result.totalPages,
                truncated: result.truncated,
                events,
            },
            {
                headers: {
                    "cache-control":
                        `public, s-maxage=${cacheTtlSeconds}, max-age=60, stale-while-revalidate=300`,
                },
            },
        );

        await cache.put(cacheKey, response.clone());
        return response;
    } catch {
        return Response.json(
            {
                ok: false,
                message: "Verzeichnisdaten sind derzeit nicht verfuegbar.",
            },
            { status: 502, headers: { "cache-control": "no-store" } },
        );
    }
}
