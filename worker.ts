// Cloudflare Worker Secret type (if not provided by @cloudflare/workers-types)
interface Secret {
    toString(): string;
}

interface Env {
    ASSETS: Fetcher;
    SENDY_BASE_URL?: string;
    SENDY_LIST_ID: Secret;
    SENDY_API_KEY?: Secret;
}

type Fetcher = {
    fetch(request: Request | URL | string): Promise<Response>;
};

type ExportedHandler<TEnv> = {
    fetch(request: Request, env: TEnv): Promise<Response>;
};

type JsonBody = {
    ok: boolean;
    message: string;
    [key: string]: unknown;
};

type CacheStorageWithDefault = CacheStorage & {
    default: Cache;
};

const NEWSLETTER_SUBSCRIBE_PATH = "/api/newsletter/subscribe";
const NEWSLETTER_UNSUBSCRIBE_PATH = "/api/newsletter/unsubscribe";
const NEWSLETTER_UNSUBSCRIBE_ALIAS_PATH = "/api/newsletter/unsub";
const NEWSLETTER_STATUS_PATH = "/api/newsletter/status";
const NEWSLETTER_NONCE_PATH = "/api/newsletter/nonce";
const NEWSLETTER_NONCE_TTL_SECONDS = 300; // 5 minutes
const WORDPRESS_AUTH_STATUS_PATH = "/api/wp-auth-status";
const BLOG_POSTS_PATH = "/api/posts";
const ANNOUNCEMENTS_PATH = "/api/announcements";
const DJ_CPT_LIST_PATH = "/api/dj-cpt";
const LINKS_FEED_PATH = "/api/links";
const EVENTS_LIST_PATH = "/api/events";
const EVENT_DETAIL_PATH = /^\/api\/events\/(\d+)$/;
const VENUES_LIST_PATH = "/api/venues";
const ORGANIZERS_LIST_PATH = "/api/organizers";
const SITEMAP_PATH = "/sitemap.xml";
const MOBILE_ORIGIN = "https://mobile.rhein-neckar-tango.de";
const SITEMAP_CACHE_TTL_SECONDS = 60;
const SITEMAP_SWR_SECONDS = 300;
const STATIC_SITEMAP_PATHS = [
    "",
    "/blog",
    "/ankuendigungen",
    "/kalender",
    "/djs",
    "/tanzraeume",
    "/veranstalter",
    "/links",
    "/newsletter",
    "/impressum",
    "/datenschutz",
    "/cookie-richtlinie",
    "/was-ist-neu",
];
const WP_POSTS_BASE_URL =
    "https://www.rhein-neckar-tango.de/wp-json/wp/v2/posts";
const WP_ANNOUNCEMENTS_BASE_URL =
    "https://www.rhein-neckar-tango.de/wp-json/wp/v2/ankuendigung";
const TRIBE_EVENTS_BASE_URL =
    "https://www.rhein-neckar-tango.de/wp-json/tribe/events/v1/events";
const WP_DJ_CPT_BASE_URL = "https://www.rhein-neckar-tango.de/wp-json/wp/v2/dj";
const LINKS_FEED_URL =
    "https://www.rhein-neckar-tango.de/feed/linklibraryfeed?settingsset=1";
const TRIBE_VENUES_BASE_URL =
    "https://www.rhein-neckar-tango.de/wp-json/tribe/events/v1/venues";
const TRIBE_ORGANIZERS_BASE_URL =
    "https://www.rhein-neckar-tango.de/wp-json/tribe/events/v1/organizers";
const WORDPRESS_ORIGIN = "https://www.rhein-neckar-tango.de";
const WORDPRESS_ADMIN_URL = `${WORDPRESS_ORIGIN}/wp-admin/`;
const WORDPRESS_PROFILE_URL = `${WORDPRESS_ADMIN_URL}profile.php`;
const REQUEST_TIMEOUT_MS = 8000;
const EVENTS_CACHE_TTL_SECONDS = 300;
const DJ_CPT_CACHE_TTL_SECONDS = 1800;
const LINKS_FEED_CACHE_TTL_SECONDS = 3600;
const VENUES_CACHE_TTL_SECONDS = 1800;
const ORGANIZERS_CACHE_TTL_SECONDS = 1800;
const GENERIC_ERROR_MESSAGE =
    "Die Anmeldung war gerade nicht moeglich. Bitte versuche es spaeter erneut.";
const SUCCESS_MESSAGE =
    "Vielen Dank! Du erhaeltst gleich eine Bestaetigungs-E-Mail – bitte klicke dort auf den Bestaetigungs-Link, um deine Anmeldung abzuschliessen.";
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_CACHE_TTL = 65; // seconds (slightly more than window)

function getClientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-real-ip") ?? "unknown";
}

function createWorkerCacheKey(request: Request, path: string): Request {
    return new Request(new URL(path, request.url).toString());
}

async function checkRateLimit(request: Request): Promise<Response | null> {
    const ip = getClientIp(request);
    if (ip === "unknown") return null;

    const cache = getDefaultCache();
    const cacheKey = createWorkerCacheKey(
        request,
        `/__worker-cache/rate-limit/${encodeURIComponent(ip)}`,
    );
    const cached = await cache.match(cacheKey);

    if (cached) {
        const data = (await cached.json()) as { count: number; windowStart: number };
        const now = Date.now();
        if (now - data.windowStart > RATE_LIMIT_WINDOW_MS) {
            // Window expired, reset
            await cache.put(
                cacheKey,
                Response.json({ count: 1, windowStart: now }, {
                    headers: { "cache-control": `public, s-maxage=${RATE_LIMIT_CACHE_TTL}` },
                }),
            );
            return null;
        }
        if (data.count >= RATE_LIMIT_MAX) {
            return new Response(
                JSON.stringify({ ok: false, message: "Zu viele Anfragen. Bitte warte einen Moment." }),
                { status: 429, headers: { "content-type": "application/json" } },
            );
        }
        // Increment count
        await cache.put(
            cacheKey,
            Response.json({ count: data.count + 1, windowStart: data.windowStart }, {
                headers: { "cache-control": `public, s-maxage=${RATE_LIMIT_CACHE_TTL}` },
            }),
        );
        return null;
    }

    // First request in window
    await cache.put(
        cacheKey,
        Response.json({ count: 1, windowStart: Date.now() }, {
            headers: { "cache-control": `public, s-maxage=${RATE_LIMIT_CACHE_TTL}` },
        }),
    );
    return null;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const eventDetailMatch = url.pathname.match(EVENT_DETAIL_PATH);
        const rateLimitResponse = await checkRateLimit(request);
        if (rateLimitResponse) {
            return rateLimitResponse;
        }

        if (url.pathname === BLOG_POSTS_PATH) {
            return proxyTribeRequest(request, WP_POSTS_BASE_URL);
        }

        if (url.pathname === ANNOUNCEMENTS_PATH) {
            return proxyTribeRequest(request, WP_ANNOUNCEMENTS_BASE_URL);
        }

        if (url.pathname === DJ_CPT_LIST_PATH) {
            return proxyTribeRequest(
                request,
                WP_DJ_CPT_BASE_URL,
                DJ_CPT_CACHE_TTL_SECONDS,
            );
        }

        if (url.pathname === LINKS_FEED_PATH) {
            return proxyRssFeed(request);
        }

        if (url.pathname === EVENTS_LIST_PATH) {
            return proxyTribeRequest(
                request,
                TRIBE_EVENTS_BASE_URL,
                EVENTS_CACHE_TTL_SECONDS,
            );
        }

        if (eventDetailMatch) {
            return handleEventDetail(
                request,
                Number.parseInt(eventDetailMatch[1], 10),
            );
        }

        if (url.pathname === VENUES_LIST_PATH) {
            return proxyTribeRequest(
                request,
                TRIBE_VENUES_BASE_URL,
                VENUES_CACHE_TTL_SECONDS,
            );
        }

        if (url.pathname === ORGANIZERS_LIST_PATH) {
            return proxyTribeRequest(
                request,
                TRIBE_ORGANIZERS_BASE_URL,
                ORGANIZERS_CACHE_TTL_SECONDS,
            );
        }

        if (url.pathname === NEWSLETTER_SUBSCRIBE_PATH) {
            return handleNewsletterSubscribe(request, env);
        }

        if (
            url.pathname === NEWSLETTER_UNSUBSCRIBE_PATH ||
            url.pathname === NEWSLETTER_UNSUBSCRIBE_ALIAS_PATH
        ) {
            return handleNewsletterUnsubscribe(request, env);
        }

        if (url.pathname === NEWSLETTER_STATUS_PATH) {
            return handleNewsletterStatus(request, env);
        }

        if (url.pathname === WORDPRESS_AUTH_STATUS_PATH) {
            return handleWordPressAuthStatus(request);
        }

        if (url.pathname === NEWSLETTER_NONCE_PATH) {
            return handleNewsletterNonce(request);
        }

        if (url.pathname === SITEMAP_PATH) {
            return handleSitemap(request);
        }

        return env.ASSETS.fetch(request);
    },
} satisfies ExportedHandler<Env>;

async function handleWordPressAuthStatus(request: Request): Promise<Response> {
    if (request.method !== "GET") {
        return json({ ok: false, message: "Methode nicht erlaubt." }, 405);
    }

    const loginUrl = buildWordPressLoginUrl();

    // Do not forward client cookies to WordPress.
    // Return only generic, non-session-sensitive availability info.
    // The frontend can use this to determine if WordPress is reachable,
    // but cannot infer the client's WordPress login state.
    try {
        const response = await fetchWithTimeout(WORDPRESS_PROFILE_URL, {
            method: "HEAD",
            redirect: "manual",
            headers: {
                accept: "text/html,application/xhtml+xml",
                "user-agent": "rnt-mobile-wordpress-status/1.0",
            },
        });

        const location = response.headers.get("location")?.toLowerCase() ?? "";
        const redirectedToLogin =
            location.includes("/wp-login.php") ||
            response.status === 301 ||
            response.status === 302 ||
            response.status === 303 ||
            response.status === 307 ||
            response.status === 308;

        return json(
            {
                ok: true,
                message: "WordPress ist verfuegbar.",
                available: !redirectedToLogin || response.status === 200,
                loginUrl,
                adminUrl: WORDPRESS_ADMIN_URL,
            },
            200,
        );
    } catch (error) {
        const status = isAbortError(error) ? 504 : 502;
        const message = isAbortError(error)
            ? "Die WordPress-Status-Pruefung hat zu lange gedauert."
            : "Der WordPress-Status ist derzeit nicht verfuegbar.";

        return json(
            {
                ok: false,
                available: false,
                message,
                loginUrl,
                adminUrl: WORDPRESS_ADMIN_URL,
            },
            status,
        );
    }
}

async function handleEventDetail(
    request: Request,
    eventId: number,
): Promise<Response> {
    if (request.method !== "GET") {
        return json({ ok: false, message: "Methode nicht erlaubt." }, 405);
    }

    if (!Number.isInteger(eventId) || eventId <= 0) {
        return json({ ok: false, message: "Ungueltige Veranstaltungs-ID." }, 400);
    }

    try {
        return proxyTribeRequest(request, `${TRIBE_EVENTS_BASE_URL}/${eventId}`);
    } catch (error) {
        const status = isAbortError(error) ? 504 : 502;
        const message = isAbortError(error)
            ? "Die Veranstaltungsdaten konnten nicht rechtzeitig geladen werden."
            : "Die Veranstaltungsdaten sind derzeit nicht verfuegbar.";

        return json({ ok: false, message }, status);
    }
}

async function proxyTribeRequest(
    request: Request,
    targetBaseUrl: string,
    cacheTtlSeconds: number = 0,
): Promise<Response> {
    if (request.method !== "GET") {
        return json({ ok: false, message: "Methode nicht erlaubt." }, 405);
    }

    const targetUrl = new URL(targetBaseUrl);
    const incomingUrl = new URL(request.url);
    targetUrl.search = incomingUrl.search;

    const cacheKey = new Request(targetUrl.toString());

    if (cacheTtlSeconds > 0) {
        const cache = getDefaultCache();
        const cached = await cache.match(cacheKey);
        if (cached) {
            return cached;
        }
    }

    try {
        const response = await fetchWithTimeout(targetUrl.toString(), {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        const browserTtl = Math.min(cacheTtlSeconds, 60);
        const cacheControl =
            cacheTtlSeconds > 0
                ? `public, s-maxage=${cacheTtlSeconds}, max-age=${browserTtl}`
                : "no-store";

        const proxiedResponse = new Response(response.body, {
            status: response.status,
            headers: {
                "cache-control": cacheControl,
                "content-type":
                    response.headers.get("content-type") ??
                    "application/json; charset=utf-8",
            },
        });

        if (cacheTtlSeconds > 0 && response.ok) {
            const cache = getDefaultCache();
            await cache.put(cacheKey, proxiedResponse.clone());
        }

        return proxiedResponse;
    } catch (error) {
        const status = isAbortError(error) ? 504 : 502;
        const message = isAbortError(error)
            ? "Die Veranstaltungsdaten konnten nicht rechtzeitig geladen werden."
            : "Die Veranstaltungsdaten sind derzeit nicht verfuegbar.";

        return json({ ok: false, message }, status);
    }
}

async function handleNewsletterNonce(request: Request): Promise<Response> {
    if (request.method !== "GET") {
        return json({ ok: false, message: "Methode nicht erlaubt." }, 405);
    }

    // Generate a random nonce and store it in the cache with TTL.
    const nonce = crypto.randomUUID();
    const cacheKey = createWorkerCacheKey(
        request,
        `${NEWSLETTER_NONCE_PATH}/${encodeURIComponent(nonce)}`,
    );
    const cache = getDefaultCache();
    const nonceValue = JSON.stringify({ nonce });
    await cache.put(cacheKey, new Response(nonceValue));
    // Cloudflare cache TTL is controlled by the Cache-Control header.
    const response = new Response(nonceValue, {
        status: 200,
        headers: {
            "cache-control": `public, s-maxage=${NEWSLETTER_NONCE_TTL_SECONDS}, max-age=0`,
        },
    });
    return response;
}

async function handleNewsletterSubscribe(
    request: Request,
    env: Env,
): Promise<Response> {
    if (request.method !== "POST") {
        return json({ ok: false, message: "Methode nicht erlaubt." }, 405);
    }

    // Task 1.5: Enforce CSRF-safe behavior — reject when Origin is absent.
    const requestUrl = new URL(request.url);
    const origin = request.headers.get("origin");
    if (!origin || origin !== requestUrl.origin) {
        return json({ ok: false, message: "Ungueltige Herkunft." }, 403);
    }

    // Task 1.4: Require explicit nonce (authenticity proof).
    const contentType = request.headers.get("content-type") ?? "";
    let nonce = "";
    if (contentType.includes("application/json")) {
        const body = (await request.json().catch(() => null)) as {
            nonce?: unknown;
        } | null;
        nonce = typeof body?.nonce === "string" ? body.nonce.trim() : "";
    } else {
        const formData = await request.formData();
        nonce = String(formData.get("nonce") ?? "").trim();
    }
    if (!nonce) {
        return json({ ok: false, message: "Ungueltige Herkunft." }, 403);
    }
    const nonceCacheKey = createWorkerCacheKey(
        request,
        `${NEWSLETTER_NONCE_PATH}/${encodeURIComponent(nonce)}`,
    );
    const nonceCache = getDefaultCache();
    const nonceResponse = await nonceCache.match(nonceCacheKey);
    if (!nonceResponse) {
        return json({ ok: false, message: "Ungueltige Herkunft." }, 403);
    }
    await nonceCache.delete(nonceCacheKey); // one-time use

    const config = getSendyConfig(env);
    if (!config.ok) {
        return json({ ok: false, message: config.message }, 500);
    }

    const payload = await parseRequestPayload(request);
    if (!payload.ok) {
        return json({ ok: false, message: payload.message }, 400);
    }

    if (payload.hp.length > 0) {
        return json({ ok: true, message: SUCCESS_MESSAGE }, 200);
    }

    const sendyParams: Record<string, string> = {
        email: payload.email,
        list: config.listId,
        gdpr: "true",
        hp: "",
        boolean: "true",
    };
    if (config.apiKey) {
        sendyParams["api_key"] = config.apiKey;
    }
    const sendyBody = new URLSearchParams(sendyParams);

    try {
        const response = await fetchWithTimeout(
            new URL("/subscribe", config.baseUrl).toString(),
            {
                method: "POST",
                headers: {
                    accept: "text/plain",
                    "content-type": "application/x-www-form-urlencoded",
                },
                body: sendyBody.toString(),
            },
        );

        const sendyText = (await response.text()).trim();
        const normalized = normalizeSendyResponse(response.ok, sendyText);
        return json(normalized.body, normalized.status);
    } catch (error) {
        const message = isAbortError(error)
            ? "Die Anmeldung hat zu lange gedauert. Bitte versuche es erneut."
            : GENERIC_ERROR_MESSAGE;
        const status = isAbortError(error) ? 504 : 502;
        return json({ ok: false, message }, status);
    }
}

async function handleNewsletterUnsubscribe(
    request: Request,
    env: Env,
): Promise<Response> {
    if (request.method !== "POST") {
        return json({ ok: false, message: "Methode nicht erlaubt." }, 405);
    }

    // Task 1.5: Enforce CSRF-safe behavior — reject when Origin is absent.
    const requestUrl = new URL(request.url);
    const origin = request.headers.get("origin");
    if (!origin || origin !== requestUrl.origin) {
        return json({ ok: false, message: "Ungueltige Herkunft." }, 403);
    }

    // Task 1.4: Require explicit nonce (authenticity proof).
    const contentType = request.headers.get("content-type") ?? "";
    let nonce = "";
    if (contentType.includes("application/json")) {
        const body = (await request.json().catch(() => null)) as {
            nonce?: unknown;
        } | null;
        nonce = typeof body?.nonce === "string" ? body.nonce.trim() : "";
    } else {
        const formData = await request.formData();
        nonce = String(formData.get("nonce") ?? "").trim();
    }
    if (!nonce) {
        return json({ ok: false, message: "Ungueltige Herkunft." }, 403);
    }
    const nonceCacheKey = createWorkerCacheKey(
        request,
        `${NEWSLETTER_NONCE_PATH}/${encodeURIComponent(nonce)}`,
    );
    const nonceCache = getDefaultCache();
    const nonceResponse = await nonceCache.match(nonceCacheKey);
    if (!nonceResponse) {
        return json({ ok: false, message: "Ungueltige Herkunft." }, 403);
    }
    await nonceCache.delete(nonceCacheKey); // one-time use

    const config = getSendyConfig(env);
    if (!config.ok) {
        return json({ ok: false, message: config.message }, 500);
    }

    const payload = await parseRequestPayload(request);
    if (!payload.ok) {
        return json({ ok: false, message: payload.message }, 400);
    }

    try {
        const response = await fetchWithTimeout(
            new URL("/unsubscribe", config.baseUrl).toString(),
            {
                method: "POST",
                headers: {
                    accept: "text/plain",
                    "content-type": "application/x-www-form-urlencoded",
                },
                body: (() => {
                    const p: Record<string, string> = {
                        email: payload.email,
                        list: config.listId,
                        boolean: "true",
                    };
                    if (config.apiKey) p["api_key"] = config.apiKey;
                    return new URLSearchParams(p).toString();
                })(),
            },
        );

        const sendyText = (await response.text()).trim();
        const normalized = normalizeSendyUnsubscribeResponse(
            response.ok,
            sendyText,
        );
        return json(normalized.body, normalized.status);
    } catch (error) {
        const message = isAbortError(error)
            ? "Die Abmeldung hat zu lange gedauert. Bitte versuche es erneut."
            : "Die Abmeldung war gerade nicht moeglich. Bitte versuche es spaeter erneut.";
        const status = isAbortError(error) ? 504 : 502;
        return json({ ok: false, message }, status);
    }
}

async function handleNewsletterStatus(
    request: Request,
    env: Env,
): Promise<Response> {
    if (request.method !== "POST") {
        return json({ ok: false, message: "Methode nicht erlaubt." }, 405);
    }

    // Task 1.5: Enforce CSRF-safe behavior — reject when Origin is absent.
    const requestUrl = new URL(request.url);
    const origin = request.headers.get("origin");
    if (!origin || origin !== requestUrl.origin) {
        return json({ ok: false, message: "Ungueltige Herkunft." }, 403);
    }

    const config = getSendyConfigInternal(env, true);
    if (!config.ok) {
        return json({ ok: false, message: config.message, available: false }, 503);
    }

    const payload = await parseRequestPayload(request);
    if (!payload.ok) {
        return json({ ok: false, message: payload.message, available: true }, 400);
    }

    try {
        const response = await fetchWithTimeout(
            new URL(
                "/api/subscribers/subscription-status.php",
                config.baseUrl,
            ).toString(),
            {
                method: "POST",
                headers: {
                    accept: "text/plain",
                    "content-type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    api_key: config.apiKey,
                    email: payload.email,
                    list_id: config.listId,
                }).toString(),
            },
        );

        const sendyText = (await response.text()).trim();
        const normalized = normalizeSendyStatusResponse(response.ok, sendyText);
        return json(normalized.body, normalized.status);
    } catch (error) {
        const message = isAbortError(error)
            ? "Die Status-Pruefung hat zu lange gedauert. Bitte versuche es erneut."
            : "Der Newsletter-Status ist derzeit nicht verfuegbar.";
        const status = isAbortError(error) ? 504 : 502;
        return json({ ok: false, message, available: true }, status);
    }
}

function getSendyConfig(
    env: Env,
):
    | { ok: true; baseUrl: string; listId: string; apiKey: string }
    | { ok: false; message: string } {
    return getSendyConfigInternal(env, false);
}

function getSendyConfigInternal(
    env: Env,
    requireApiKey: boolean,
):
    | { ok: true; baseUrl: string; listId: string; apiKey: string }
    | { ok: false; message: string } {
    const baseUrl = env.SENDY_BASE_URL?.trim().replace(/\/$/, "");
    const listId = env.SENDY_LIST_ID?.toString().trim();
    const apiKey = env.SENDY_API_KEY?.toString().trim() ?? "";

    if (!baseUrl || !listId) {
        return {
            ok: false,
            message: "Newsletter-Konfiguration fehlt auf dem Server.",
        };
    }

    if (requireApiKey && !apiKey) {
        return {
            ok: false,
            message: "Die Status-Pruefung ist derzeit nicht verfuegbar.",
        };
    }

    return { ok: true, baseUrl, listId, apiKey };
}

async function parseRequestPayload(
    request: Request,
): Promise<
    { ok: true; email: string; hp: string } | { ok: false; message: string }
> {
    const contentType = request.headers.get("content-type") ?? "";
    let email = "";
    let hp = "";

    if (contentType.includes("application/json")) {
        const body = (await request.json().catch(() => null)) as {
            email?: unknown;
            hp?: unknown;
        } | null;
        email = typeof body?.email === "string" ? body.email.trim() : "";
        hp = typeof body?.hp === "string" ? body.hp.trim() : "";
    } else {
        const formData = await request.formData();
        email = String(formData.get("email") ?? "").trim();
        hp = String(formData.get("hp") ?? formData.get("website") ?? "").trim();
    }

    if (!email) {
        return { ok: false, message: "Bitte gib eine E-Mail-Adresse ein." };
    }

    if (!isValidEmailAddress(email)) {
        return { ok: false, message: "Bitte pruefe die E-Mail-Adresse." };
    }

    return { ok: true, email, hp };
}

function isValidEmailAddress(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function fetchWithTimeout(
    input: RequestInfo | URL,
    init: RequestInit,
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        return await fetch(input, {
            ...init,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeoutId);
    }
}

function buildWordPressLoginUrl(): string {
    const url = new URL("/wp-login.php", WORDPRESS_ORIGIN);
    url.searchParams.set("redirect_to", WORDPRESS_ADMIN_URL);
    return url.toString();
}

function normalizeSendyResponse(
    responseOk: boolean,
    sendyText: string,
): {
    status: number;
    body: JsonBody;
} {
    const normalizedText = sendyText.trim();
    const lower = normalizedText.toLowerCase();

    if (responseOk && normalizedText === "1") {
        return {
            status: 200,
            body: { ok: true, message: SUCCESS_MESSAGE },
        };
    }

    if (lower.includes("already subscribed")) {
        return {
            status: 200,
            body: {
                ok: true,
                message: "Diese Adresse ist bereits fuer den Newsletter eingetragen.",
                already_subscribed: true,
            },
        };
    }

    if (lower.includes("invalid email")) {
        return {
            status: 400,
            body: { ok: false, message: "Bitte pruefe die E-Mail-Adresse." },
        };
    }

    if (lower.includes("some fields are missing")) {
        return {
            status: 400,
            body: { ok: false, message: "Bitte gib eine E-Mail-Adresse ein." },
        };
    }

    if (
        lower.includes("api key not passed") ||
        lower.includes("invalid api key")
    ) {
        return {
            status: 500,
            body: {
                ok: false,
                message: "Newsletter-Konfiguration fehlt auf dem Server.",
            },
        };
    }

    {
        const userMessage =
            normalizedText && !/^[01]$/.test(normalizedText)
                ? normalizedText
                : GENERIC_ERROR_MESSAGE;
        return {
            status: responseOk ? 502 : 500,
            body: { ok: false, message: userMessage },
        };
    }
}

function normalizeSendyUnsubscribeResponse(
    responseOk: boolean,
    sendyText: string,
): {
    status: number;
    body: JsonBody;
} {
    const normalizedText = sendyText.trim();
    const lower = normalizedText.toLowerCase();

    if (responseOk && (normalizedText === "true" || normalizedText === "1")) {
        return {
            status: 200,
            body: {
                ok: true,
                message: "Du wurdest erfolgreich vom Newsletter abgemeldet.",
            },
        };
    }

    if (lower.includes("invalid email")) {
        return {
            status: 400,
            body: { ok: false, message: "Bitte pruefe die E-Mail-Adresse." },
        };
    }

    if (lower.includes("email does not exist")) {
        return {
            status: 404,
            body: {
                ok: false,
                message: "Diese Adresse ist in der Liste derzeit nicht eingetragen.",
            },
        };
    }

    if (lower.includes("some fields are missing")) {
        return {
            status: 400,
            body: { ok: false, message: "Bitte gib eine E-Mail-Adresse ein." },
        };
    }

    {
        const UNSUB_GENERIC =
            "Die Abmeldung war gerade nicht moeglich. Bitte versuche es spaeter erneut.";
        const userMessage =
            normalizedText && !/^(true|false|1|0)$/i.test(normalizedText)
                ? normalizedText
                : UNSUB_GENERIC;
        return {
            status: responseOk ? 502 : 500,
            body: { ok: false, message: userMessage },
        };
    }
}

function normalizeSendyStatusResponse(
    responseOk: boolean,
    sendyText: string,
): {
    status: number;
    body: JsonBody & {
        status?:
        | "subscribed"
        | "unsubscribed"
        | "unconfirmed"
        | "bounced"
        | "soft-bounced"
        | "complained"
        | "unknown";
        available: boolean;
    };
} {
    const normalizedText = sendyText.trim();
    const lower = normalizedText.toLowerCase();

    if (responseOk) {
        if (lower === "subscribed") {
            return {
                status: 200,
                body: {
                    ok: true,
                    message: "Diese Adresse ist aktiv eingetragen.",
                    status: "subscribed",
                    available: true,
                },
            };
        }

        if (lower === "unsubscribed") {
            return {
                status: 200,
                body: {
                    ok: true,
                    message: "Diese Adresse ist abgemeldet.",
                    status: "unsubscribed",
                    available: true,
                },
            };
        }

        if (lower === "unconfirmed") {
            return {
                status: 200,
                body: {
                    ok: true,
                    message: "Diese Adresse wartet noch auf Bestaetigung.",
                    status: "unconfirmed",
                    available: true,
                },
            };
        }

        if (lower === "bounced") {
            return {
                status: 200,
                body: {
                    ok: true,
                    message: "Diese Adresse ist als Bounce markiert.",
                    status: "bounced",
                    available: true,
                },
            };
        }

        if (lower === "soft bounced") {
            return {
                status: 200,
                body: {
                    ok: true,
                    message: "Diese Adresse ist als Soft Bounce markiert.",
                    status: "soft-bounced",
                    available: true,
                },
            };
        }

        if (lower === "complained") {
            return {
                status: 200,
                body: {
                    ok: true,
                    message: "Diese Adresse hat sich ueber eine Nachricht beschwert.",
                    status: "complained",
                    available: true,
                },
            };
        }
    }

    if (lower.includes("email does not exist")) {
        return {
            status: 404,
            body: {
                ok: false,
                message: "Diese Adresse wurde in der Liste nicht gefunden.",
                status: "unknown",
                available: true,
            },
        };
    }

    if (
        lower.includes("invalid api key") ||
        lower.includes("api key not passed")
    ) {
        return {
            status: 503,
            body: {
                ok: false,
                message: "Die Status-Pruefung ist derzeit nicht verfuegbar.",
                status: "unknown",
                available: false,
            },
        };
    }

    if (
        lower.includes("email not passed") ||
        lower.includes("list id not passed") ||
        lower.includes("no data passed")
    ) {
        return {
            status: 400,
            body: {
                ok: false,
                message: "Bitte gib eine E-Mail-Adresse ein.",
                status: "unknown",
                available: true,
            },
        };
    }

    {
        const STATUS_KNOWN_CODES =
            /^(subscribed|unsubscribed|unconfirmed|bounced|soft bounced|complained|true|false|1|0)$/i;
        const STATUS_GENERIC =
            "Der Newsletter-Status ist derzeit nicht verfuegbar.";
        const userMessage =
            normalizedText && !STATUS_KNOWN_CODES.test(normalizedText)
                ? normalizedText
                : STATUS_GENERIC;
        return {
            status: responseOk ? 502 : 500,
            body: {
                ok: false,
                message: userMessage,
                status: "unknown",
                available: true,
            },
        };
    }
}

function isAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === "AbortError";
}

function json(body: JsonBody, status: number): Response {
    return Response.json(body, {
        status,
        headers: {
            "cache-control": "no-store",
        },
    });
}

function getDefaultCache(): Cache {
    return (caches as CacheStorageWithDefault).default;
}

async function proxyRssFeed(request: Request): Promise<Response> {
    if (request.method !== "GET") {
        return json({ ok: false, message: "Methode nicht erlaubt." }, 405);
    }

    const cacheKey = new Request(LINKS_FEED_URL);
    const cache = getDefaultCache();
    const cached = await cache.match(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        const response = await fetchWithTimeout(LINKS_FEED_URL, {
            method: "GET",
            headers: {
                accept: "application/rss+xml, application/xml, text/xml",
            },
        });

        if (!response.ok) {
            return json(
                { ok: false, message: "Feed nicht verfuegbar." },
                response.status,
            );
        }

        const body = await response.text();

        const proxiedResponse = new Response(body, {
            status: response.status,
            headers: {
                "cache-control": `public, s-maxage=${LINKS_FEED_CACHE_TTL_SECONDS}, max-age=60`,
                "content-type": "application/xml; charset=utf-8",
                "access-control-allow-origin": "*",
            },
        });

        return proxiedResponse;
    } catch (error) {
        // Production console.log removed — Cloudflare Workers do not surface
        // console output in production. Errors are surfaced as JSON responses.
        return json(
            { ok: false, message: "Feed konnte nicht geladen werden." },
            502,
        );
    }
}
type WpSitemapEntry = {
    slug: string;
    modified?: string;
};

async function fetchWpSitemapEntries(
    baseUrl: string,
): Promise<WpSitemapEntry[]> {
    const entries: WpSitemapEntry[] = [];
    let page = 1;

    while (page <= 50) {
        const url = new URL(baseUrl);
        url.searchParams.set("per_page", "100");
        url.searchParams.set("page", String(page));
        url.searchParams.set("_fields", "slug,modified");
        url.searchParams.set("status", "publish");

        const response = await fetchWithTimeout(url.toString(), {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (!response.ok) break;

        const batch = (await response.json()) as Array<{
            slug?: string;
            modified?: string;
        }>;

        if (!Array.isArray(batch) || batch.length === 0) break;

        for (const item of batch) {
            if (item.slug) {
                entries.push({ slug: item.slug, modified: item.modified });
            }
        }

        if (batch.length < 100) break;
        page += 1;
    }

    return entries;
}

function escapeXml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function formatSitemapLastmod(modified?: string): string | undefined {
    if (!modified) return undefined;
    const parsed = new Date(modified);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return parsed.toISOString().slice(0, 10);
}

function buildSitemapXml(
    urls: Array<{ loc: string; lastmod?: string }>,
): string {
    const body = urls
        .map((url) => {
            const lastmodLine = url.lastmod
                ? `\n    <lastmod>${escapeXml(url.lastmod)}</lastmod>`
                : "";
            return `  <url>\n    <loc>${escapeXml(url.loc)}</loc>${lastmodLine}\n  </url>`;
        })
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

async function handleSitemap(request: Request): Promise<Response> {
    if (request.method !== "GET") {
        return json({ ok: false, message: "Methode nicht erlaubt." }, 405);
    }

    const cache = getDefaultCache();
    const cacheKey = createWorkerCacheKey(request, SITEMAP_PATH);
    const cached = await cache.match(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        const [posts, announcements] = await Promise.all([
            fetchWpSitemapEntries(WP_POSTS_BASE_URL),
            fetchWpSitemapEntries(WP_ANNOUNCEMENTS_BASE_URL),
        ]);

        const urls: Array<{ loc: string; lastmod?: string }> = [];

        for (const path of STATIC_SITEMAP_PATHS) {
            urls.push({ loc: `${MOBILE_ORIGIN}${path}` });
        }

        for (const post of posts) {
            urls.push({
                loc: `${MOBILE_ORIGIN}/blog/${post.slug}`,
                lastmod: formatSitemapLastmod(post.modified),
            });
        }

        for (const announcement of announcements) {
            urls.push({
                loc: `${MOBILE_ORIGIN}/ankuendigungen/${announcement.slug}`,
                lastmod: formatSitemapLastmod(announcement.modified),
            });
        }

        const xml = buildSitemapXml(urls);
        const response = new Response(xml, {
            status: 200,
            headers: {
                "content-type": "application/xml; charset=utf-8",
                "cache-control": `public, s-maxage=${SITEMAP_CACHE_TTL_SECONDS}, stale-while-revalidate=${SITEMAP_SWR_SECONDS}`,
            },
        });

        await cache.put(cacheKey, response.clone());
        return response;
    } catch (error) {
        const status = isAbortError(error) ? 504 : 502;
        return json(
            { ok: false, message: "Sitemap konnte nicht erzeugt werden." },
            status,
        );
    }
}
