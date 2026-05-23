import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker from "../worker";

const AUTH_PATH = "https://rnt-mobile.test/api/wp-auth-status";
const EVENTS_PATH = "https://rnt-mobile.test/api/events?per_page=3";
const WORDPRESS_PROFILE_URL =
    "https://www.rhein-neckar-tango.de/wp-admin/profile.php";

function createRequest(
    url: string = AUTH_PATH,
    options?: {
        cookie?: string;
        headers?: Record<string, string>;
    },
): Request {
    const headers = new Headers();
    if (options?.cookie) {
        headers.set("cookie", options.cookie);
    }
    for (const [key, value] of Object.entries(options?.headers ?? {})) {
        headers.set(key, value);
    }

    return new Request(url, {
        method: "GET",
        headers,
    });
}

function createEnv() {
    return {
        ASSETS: {
            fetch: vi.fn(async () =>
                new Response("not-found", {
                    status: 404,
                }),
            ),
        },
        SENDY_LIST_ID: {
            toString: () => "test-list-id",
        } as unknown as { toString: () => string },
    };
}

describe("Worker /api/wp-auth-status", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.stubGlobal("caches", {
            default: {
                match: vi.fn(async () => undefined),
                put: vi.fn(async () => undefined),
                delete: vi.fn(async () => false),
            },
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns generic status when no cookie is present (no session forwarding)", async () => {
        const fetchSpy = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValueOnce(new Response("profile", { status: 200 }));
        const response = await worker.fetch(createRequest(), createEnv());
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(response.headers.get("cache-control")).toBe("no-store");
        expect(fetchSpy).toHaveBeenCalledWith(
            WORDPRESS_PROFILE_URL,
            expect.objectContaining({
                method: "HEAD",
                redirect: "manual",
            }),
        );
        // No longer forwards WordPress cookies — returns generic availability only.
        expect(body).toMatchObject({
            ok: true,
            available: true,
            message: "WordPress ist verfuegbar.",
            adminUrl: "https://www.rhein-neckar-tango.de/wp-admin/",
        });
        expect(String(body.loginUrl)).toContain("wp-login.php");
        expect(body).not.toHaveProperty("loggedIn");
    });

    it("handles rate-limited API requests with client IP headers without crashing", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            new Response(JSON.stringify({ events: [], total_pages: 1 }), {
                status: 200,
                headers: {
                    "content-type": "application/json; charset=utf-8",
                },
            }),
        );

        const response = await worker.fetch(
            createRequest(EVENTS_PATH, {
                headers: {
                    "x-forwarded-for": "203.0.113.5",
                },
            }),
            createEnv(),
        );

        expect(response.status).toBe(200);
        expect(fetchSpy).toHaveBeenCalledWith(
            expect.stringContaining("/wp-json/tribe/events/v1/events?per_page=3"),
            expect.objectContaining({
                method: "GET",
            }),
        );
    });

    it("does not forward client cookies to WordPress (session-independent)", async () => {
        const fetchSpy = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValueOnce(new Response("profile", { status: 200 }));

        const response = await worker.fetch(
            createRequest(AUTH_PATH, { cookie: "wordpress_logged_in=1" }),
            createEnv(),
        );
        const body = await response.json();

        expect(fetchSpy).toHaveBeenCalledTimes(1);
        // The worker now uses HEAD instead of GET and does NOT forward cookies.
        expect(fetchSpy).toHaveBeenCalledWith(
            WORDPRESS_PROFILE_URL,
            expect.objectContaining({
                method: "HEAD",
                redirect: "manual",
            }),
        );
        expect(body).toHaveProperty("ok", true);
        expect(body).toHaveProperty("available");
        // No longer returns loggedIn — that is session-sensitive.
        expect(body).not.toHaveProperty("loggedIn", true);
    });

    it("treats wp-login redirect as unavailable (no session info)", async () => {
        const fetchSpy = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValueOnce(
                new Response(null, {
                    status: 302,
                    headers: {
                        location:
                            "https://www.rhein-neckar-tango.de/wp-login.php?redirect_to=/wp-admin/profile.php",
                    },
                }),
            );

        const response = await worker.fetch(
            createRequest(AUTH_PATH, { cookie: "wordpress_logged_in=stale" }),
            createEnv(),
        );
        const body = await response.json();

        expect(fetchSpy).toHaveBeenCalledWith(
            WORDPRESS_PROFILE_URL,
            expect.objectContaining({
                method: "HEAD",
                redirect: "manual",
            }),
        );
        expect(body).toMatchObject({
            ok: true,
            available: false,
        });
        // No session-sensitive fields are returned.
        expect(body).not.toHaveProperty("loggedIn");
    });

    it("returns unavailable fallback when upstream request fails", async () => {
        vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("upstream"));

        const response = await worker.fetch(
            createRequest(AUTH_PATH, { cookie: "wordpress_logged_in=1" }),
            createEnv(),
        );
        const body = await response.json();

        expect(response.status).toBe(502);
        expect(body).toMatchObject({
            ok: false,
            available: false,
            message: "Der WordPress-Status ist derzeit nicht verfuegbar.",
            adminUrl: "https://www.rhein-neckar-tango.de/wp-admin/",
        });
    });
});
