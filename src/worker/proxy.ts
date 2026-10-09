type CacheStorageWithDefault = CacheStorage & {
    default: Cache;
};

export type JsonProxyOptions = {
    cacheTtlSeconds?: number;
    timeoutMs?: number;
    timeoutMessage?: string;
    errorMessage?: string;
};

function getDefaultCache(): Cache {
    return (caches as CacheStorageWithDefault).default;
}

function isAbortError(error: unknown): boolean {
    return (
        error instanceof DOMException &&
        error.name === "AbortError"
    );
}

async function fetchWithTimeout(
    input: RequestInfo | URL,
    init: RequestInit,
    timeoutMs: number,
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(input, {
            ...init,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function proxyJsonGet(
    request: Request,
    targetBaseUrl: string,
    options: JsonProxyOptions = {},
): Promise<Response> {
    if (request.method !== "GET") {
        return Response.json(
            { ok: false, message: "Methode nicht erlaubt." },
            { status: 405, headers: { "cache-control": "no-store" } },
        );
    }

    const cacheTtlSeconds = options.cacheTtlSeconds ?? 0;
    const timeoutMs = options.timeoutMs ?? 8000;
    const targetUrl = new URL(targetBaseUrl);
    targetUrl.search = new URL(request.url).search;
    const cacheKey = new Request(targetUrl.toString());

    if (cacheTtlSeconds > 0) {
        const cached = await getDefaultCache().match(cacheKey);
        if (cached) return cached;
    }

    try {
        const response = await fetchWithTimeout(
            targetUrl,
            {
                method: "GET",
                headers: { accept: "application/json" },
            },
            timeoutMs,
        );

        const browserTtl = Math.min(cacheTtlSeconds, 60);
        const proxiedResponse = new Response(response.body, {
            status: response.status,
            headers: {
                "cache-control":
                    cacheTtlSeconds > 0
                        ? `public, s-maxage=${cacheTtlSeconds}, max-age=${browserTtl}`
                        : "no-store",
                "content-type":
                    response.headers.get("content-type") ??
                    "application/json; charset=utf-8",
            },
        });

        if (cacheTtlSeconds > 0 && response.ok) {
            await getDefaultCache().put(cacheKey, proxiedResponse.clone());
        }

        return proxiedResponse;
    } catch (error) {
        const aborted = isAbortError(error);
        return Response.json(
            {
                ok: false,
                message: aborted
                    ? options.timeoutMessage ??
                        "Die Anfrage konnte nicht rechtzeitig abgeschlossen werden."
                    : options.errorMessage ??
                        "Die Daten sind derzeit nicht verfuegbar.",
            },
            {
                status: aborted ? 504 : 502,
                headers: { "cache-control": "no-store" },
            },
        );
    }
}
