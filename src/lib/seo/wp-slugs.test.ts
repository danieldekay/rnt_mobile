import { expect, it, vi } from "vitest";
import { fetchWpContentSlugs } from "./wp-slugs";

it("fails when a later slug page returns 502 instead of silently omitting pages", async () => {
  const firstPage = Array.from({ length: 100 }, (_, index) => ({ slug: `post-${index}` }));
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify(firstPage), {
      headers: { "content-type": "application/json" },
    }))
    .mockResolvedValueOnce(new Response("Bad Gateway", { status: 502 }));

  await expect(fetchWpContentSlugs("posts", fetchMock as typeof fetch))
    .rejects.toThrow("HTTP 502 on page 2");
});
