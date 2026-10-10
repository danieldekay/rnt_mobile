import { fetchBoundedEventRange } from "./bounded-events";

export type OfflineSnapshotOptions = {
    eventsBaseUrl: string;
    timeoutMs?: number;
    days?: number;
    maxPages?: number;
};

export async function handleOfflineSnapshot(
    request: Request,
    options: OfflineSnapshotOptions,
): Promise<Response> {
    if (request.method !== "GET") {
        return Response.json(
            { ok: false, message: "Methode nicht erlaubt." },
            { status: 405, headers: { "cache-control": "no-store" } },
        );
    }

    const days = options.days ?? 30;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    end.setHours(23, 59, 59, 999);

    try {
        const result = await fetchBoundedEventRange({
            eventsBaseUrl: options.eventsBaseUrl,
            start,
            end,
            timeoutMs: options.timeoutMs,
            maxPages: options.maxPages ?? 10,
            concurrency: 4,
        });

        return Response.json(
            {
                ok: true,
                generated_at: new Date().toISOString(),
                range_days: days,
                pages_fetched: result.pagesFetched,
                total_pages: result.totalPages,
                truncated: result.truncated,
                events: result.events,
            },
            {
                headers: {
                    "cache-control":
                        "public, s-maxage=300, max-age=60, stale-while-revalidate=300",
                },
            },
        );
    } catch {
        return Response.json(
            {
                ok: false,
                message: "Offline-Daten sind derzeit nicht verfuegbar.",
            },
            { status: 502, headers: { "cache-control": "no-store" } },
        );
    }
}
