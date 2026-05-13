interface Env {
  ASSETS: Fetcher;
  SENDY_BASE_URL?: string;
  SENDY_LIST_ID?: string;
  SENDY_API_KEY?: string;
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

const NEWSLETTER_SUBSCRIBE_PATH = "/api/newsletter/subscribe";
const NEWSLETTER_UNSUBSCRIBE_PATH = "/api/newsletter/unsubscribe";
const NEWSLETTER_UNSUBSCRIBE_ALIAS_PATH = "/api/newsletter/unsub";
const NEWSLETTER_STATUS_PATH = "/api/newsletter/status";
const WORDPRESS_AUTH_STATUS_PATH = "/api/wp-auth-status";
const BLOG_POSTS_PATH = "/api/posts";
const ANNOUNCEMENTS_PATH = "/api/announcements";
const DJ_CPT_LIST_PATH = "/api/dj-cpt";
const LINKS_FEED_PATH = "/api/links";
const EVENTS_LIST_PATH = "/api/events";
const EVENT_DETAIL_PATH = /^\/api\/events\/(\d+)$/;
const VENUES_LIST_PATH = "/api/venues";
const ORGANIZERS_LIST_PATH = "/api/organizers";
const WP_POSTS_BASE_URL =
  "https://www.rhein-neckar-tango.de/wp-json/wp/v2/posts";
const WP_ANNOUNCEMENTS_BASE_URL =
  "https://www.rhein-neckar-tango.de/wp-json/wp/v2/ankuendigung";
const TRIBE_EVENTS_BASE_URL =
  "https://www.rhein-neckar-tango.de/wp-json/tribe/events/v1/events";
const WP_DJ_CPT_BASE_URL = "https://www.rhein-neckar-tango.de/wp-json/wp/v2/dj";
const LINKS_FEED_URL = "https://www.rhein-neckar-tango.de/feed/linklibraryfeed?settingsset=1";
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const eventDetailMatch = url.pathname.match(EVENT_DETAIL_PATH);

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

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

async function handleWordPressAuthStatus(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return json({ ok: false, message: "Methode nicht erlaubt." }, 405);
  }

  const cookie = request.headers.get("cookie")?.trim() ?? "";
  const loginUrl = buildWordPressLoginUrl();

  if (!cookie) {
    return json(
      {
        ok: true,
        loggedIn: false,
        available: true,
        message: "Keine WordPress-Session gefunden.",
        loginUrl,
        adminUrl: WORDPRESS_ADMIN_URL,
      },
      200,
    );
  }

  try {
    const response = await fetchWithTimeout(WORDPRESS_PROFILE_URL, {
      method: "GET",
      redirect: "manual",
      headers: {
        accept: "text/html",
        cookie,
        "user-agent":
          request.headers.get("user-agent") ??
          "rnt-mobile-wordpress-status/1.0",
      },
    });

    const location = response.headers.get("location") ?? "";
    const loggedIn =
      response.status === 200 && !location.includes("wp-login.php");

    return json(
      {
        ok: true,
        loggedIn,
        available: true,
        message: loggedIn
          ? "WordPress-Session erkannt."
          : "Nicht bei WordPress eingeloggt.",
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
        loggedIn: false,
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
    const cache = caches.default;
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
      const cache = caches.default;
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

async function handleNewsletterSubscribe(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, message: "Methode nicht erlaubt." }, 405);
  }

  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin && origin !== requestUrl.origin) {
    return json({ ok: false, message: "Ungueltige Herkunft." }, 403);
  }

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

  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin && origin !== requestUrl.origin) {
    return json({ ok: false, message: "Ungueltige Herkunft." }, 403);
  }

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

  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin && origin !== requestUrl.origin) {
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
  const listId = env.SENDY_LIST_ID?.trim();
  const apiKey = env.SENDY_API_KEY?.trim() ?? "";

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

async function proxyRssFeed(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return json({ ok: false, message: "Methode nicht erlaubt." }, 405);
  }

  const cacheKey = new Request(LINKS_FEED_URL);
  const cache = caches.default;
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
      return json({ ok: false, message: "Feed nicht verfuegbar." }, response.status);
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
    console.error("Links feed proxy error:", error);
    return json({ ok: false, message: "Feed konnte nicht geladen werden." }, 502);
  }
}

