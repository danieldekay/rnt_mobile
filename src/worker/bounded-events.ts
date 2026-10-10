export type BoundedEventsPage = {
    events?: unknown[];
    total_pages?: number;
};

export type BoundedEventRangeOptions = {
    eventsBaseUrl: string;
    start: Date;
    end: Date;
    timeoutMs?: number;
    maxPages?: number;
    concurrency?: number;
};

export type BoundedEventRangeResult = {
    events: unknown[];
    pagesFetched: number;
    totalPages: number;
    truncated: boolean;
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

async function fetchPage(
    options: BoundedEventRangeOptions,
    page: number,
): Promise<BoundedEventsPage> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
        () => controller.abort(),
        options.timeoutMs ?? 8000,
    );

    const target = new URL(options.eventsBaseUrl);
    target.searchParams.set("per_page", "50");
    target.searchParams.set("page", String(page));
    target.searchParams.set("start_date", formatDate(options.start));
    target.searchParams.set("end_date", formatDate(options.end));
    target.searchParams.set("status", "publish");

    try {
        const response = await fetch(target.toString(), {
            method: "GET",
            headers: { accept: "application/json" },
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`Event page ${page} failed: ${response.status}`);
        }

        return (await response.json()) as BoundedEventsPage;
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function fetchBoundedEventRange(
    options: BoundedEventRangeOptions,
): Promise<BoundedEventRangeResult> {
    const maxPages = Math.max(1, options.maxPages ?? 10);
    const concurrency = Math.max(1, Math.min(options.concurrency ?? 4, 8));

    const firstPage = await fetchPage(options, 1);
    const events = [...(firstPage.events ?? [])];
    const totalPages = Math.max(1, Number(firstPage.total_pages ?? 1));
    const lastPage = Math.min(totalPages, maxPages);
    let pagesFetched = 1;

    for (
        let batchStart = 2;
        batchStart <= lastPage;
        batchStart += concurrency
    ) {
        const batchEnd = Math.min(
            lastPage,
            batchStart + concurrency - 1,
        );
        const pages = Array.from(
            { length: batchEnd - batchStart + 1 },
            (_, index) => batchStart + index,
        );

        const results = await Promise.all(
            pages.map((page) => fetchPage(options, page)),
        );

        for (const result of results) {
            events.push(...(result.events ?? []));
            pagesFetched += 1;
        }
    }

    return {
        events,
        pagesFetched,
        totalPages,
        truncated: totalPages > maxPages,
    };
}
