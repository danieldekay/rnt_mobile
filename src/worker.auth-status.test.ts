import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker from "../worker";

const AUTH_PATH = "https://rnt-mobile.test/api/wp-auth-status";
const WORDPRESS_PROFILE_URL =
    "https://www.rhein-neckar-tango.de/wp-admin/profile.php";

function createRequest(cookie?: string): Request {
    const headers = new Headers();
    if (cookie) {
        headers.set("cookie", cookie);
    }

    return new Request(AUTH_PATH, {
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
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns generic status when no cookie is present (no session forwarding)", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch");
        const response = await worker.fetch(createRequest(), createEnv());
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(response.headers.get("cache-control")).toBe("no-store");
        expect(fetchSpy).not.toHaveBeenCalled();
        // No longer forwards WordPress cookies — returns generic status only.
        expect(body).toMatchObject({
            ok: true,
            available: true,
            message: "WordPress ist verfuegbar.",
            adminUrl: "https://www.rhein-neckar-tango.de/wp-admin/",
        });
        expect(String(body.loginUrl)).toContain("wp-login.php");
        expect(body).toHaveProperty("loggedIn");
    });

    it("does not forward client cookies to WordPress (session-independent)", async () => {
        const fetchSpy = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValueOnce(new Response("profile", { status: 200 }));

        const response = await worker.fetch(
            createRequest("wordpress_logged_in=1"),
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
            createRequest("wordpress_logged_in=stale"),
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
            createRequest("wordpress_logged_in=1"),
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
