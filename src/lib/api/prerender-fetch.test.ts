import { describe, expect, it, vi } from "vitest";
import { createPrerenderFetch } from "./prerender-fetch";

describe("prerender fetch", () => {
  it("retries a closed connection and returns the complete response", async () => {
    const broken = new Response(new ReadableStream({
      start(controller) {
        controller.error(new Error("connection closed"));
      },
    }));
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(broken)
      .mockResolvedValueOnce(new Response('{"id":42}', {
        headers: { "content-type": "application/json" },
      }));

    const response = await createPrerenderFetch(fetchMock as typeof fetch)("https://example.test/post");

    expect(await response.json()).toEqual({ id: 42 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns a persistent bad gateway after three attempts", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => new Response("Bad Gateway", { status: 502 }));

    const response = await createPrerenderFetch(fetchMock as typeof fetch)("https://example.test/post");

    expect(response.status).toBe(502);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
