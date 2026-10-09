type SnapshotEventPage = {
    events?: unknown[];
    total_pages?: number;
};

export type OfflineSnapshotOptions = {
    eventsBaseUrl: string;
    timeoutMs?: number;
    days?: number;
    maxPages?: number;
};

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function fetchWithTimeout(
    input: RequestInfo | URL,
    timeoutMs: number,
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(input, {
            method: "GET",
            headers: { accept: "application/json" },
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeoutId);
    }
}

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

    const timeoutMs = options.timeoutMs ?? 8000;
    const days = options.days ?? 30;
    const maxPages = options.maxPages ?? 10;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    end.setHours(23, 59, 59, 999);

    const events: unknown[] = [];
    let totalPages = 1;
    let page = 1;

    try {
        while (page <= Math.min(totalPages, maxPages)) {
            const target = new URL(options.eventsBaseUrl);
            target.searchParams.set("per_page", "50");
            target.searchParams.set("page", String(page));
            target.searchParams.set("start_date", formatDate(start));
            target.searchParams.set("end_date", formatDate(end));
            target.searchParams.set("status", "publish");

            const response = await fetchWithTimeout(target, timeoutMs);
            if (!response.ok) {
                return Response.json(
                    {
                        ok: false,
                        message: "Offline-Daten sind derzeit nicht verfuegbar.",
                    },
                    { status: 502, headers: { "cache-control": "no-store" } },
                );
            }

            const data = (await response.json()) as SnapshotEventPage;
            events.push(...(data.events ?? []));
            totalPages = Math.max(1, Number(data.total_pages ?? 1));
            page += 1;
        }

        return Response.json(
            {
                ok: true,
                generated_at: new Date().toISOString(),
                range_days: days,
                truncated: totalPages > maxPages,
                events,
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
