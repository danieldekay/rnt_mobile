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
  };
}

describe("Worker /api/wp-auth-status", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns logged-out status when no cookie is present", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const response = await worker.fetch(createRequest(), createEnv());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(body).toMatchObject({
      ok: true,
      loggedIn: false,
      available: true,
      message: "Keine WordPress-Session gefunden.",
      adminUrl: "https://www.rhein-neckar-tango.de/wp-admin/",
    });
    expect(String(body.loginUrl)).toContain("wp-login.php");
  });

  it("uses wp-admin profile endpoint to recognize authenticated session", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("profile", { status: 200 }));

    const response = await worker.fetch(
      createRequest("wordpress_logged_in=1"),
      createEnv(),
    );
    const body = await response.json();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      WORDPRESS_PROFILE_URL,
      expect.objectContaining({
        method: "GET",
        redirect: "manual",
      }),
    );
    expect(body).toMatchObject({
      ok: true,
      loggedIn: true,
      available: true,
      message: "WordPress-Session erkannt.",
    });
  });

  it("treats wp-login redirect response as logged out", async () => {
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
        method: "GET",
        redirect: "manual",
      }),
    );
    expect(body).toMatchObject({
      ok: true,
      loggedIn: false,
      available: true,
      message: "Nicht bei WordPress eingeloggt.",
    });
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
      loggedIn: false,
      available: false,
      message: "Der WordPress-Status ist derzeit nicht verfuegbar.",
      adminUrl: "https://www.rhein-neckar-tango.de/wp-admin/",
    });
  });
});