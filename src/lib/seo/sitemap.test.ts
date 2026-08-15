import { describe, expect, it } from "vitest";

import { buildSitemapXml, generateSitemapXml } from "./sitemap";

describe("buildSitemapXml", () => {
	it("renders valid urlset entries", () => {
		const xml = buildSitemapXml([
			{
				loc: "https://mobile.rhein-neckar-tango.de/event/1",
				lastmod: "2026-08-15",
			},
		]);

		expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
		expect(xml).toContain("<loc>https://mobile.rhein-neckar-tango.de/event/1</loc>");
		expect(xml).toContain("<lastmod>2026-08-15</lastmod>");
	});
});

describe("generateSitemapXml", () => {
	it("includes upcoming events and excludes past events", async () => {
		const fetcher = async (input: string | URL | Request) => {
			const url = String(input);

			if (url.includes("/wp-json/wp/v2/posts")) {
				return Response.json([]);
			}
			if (url.includes("/wp-json/wp/v2/ankuendigung")) {
				return Response.json([]);
			}
			if (url.includes("/wp-json/tribe/events/v1/events")) {
				return Response.json({
					events: [
						{
							id: 100,
							modified: "2026-08-10T10:00:00",
							end_date: "2026-12-01 23:00:00",
						},
						{
							id: 101,
							modified: "2026-07-01T10:00:00",
							end_date: "2026-06-01 23:00:00",
						},
					],
					total_pages: 1,
				});
			}
			if (url.includes("/wp-json/tribe/events/v1/venues")) {
				return Response.json({ venues: [{ slug: "studio-a" }] });
			}
			if (url.includes("/wp-json/tribe/events/v1/organizers")) {
				return Response.json({ organizers: [{ slug: "rnt-ev" }] });
			}
			if (url.includes("/wp-json/wp/v2/dj")) {
				return Response.json([{ slug: "dj-anna" }]);
			}

			return new Response(null, { status: 404 });
		};

		const xml = await generateSitemapXml(fetcher);

		expect(xml).toContain("https://mobile.rhein-neckar-tango.de/event/100");
		expect(xml).not.toContain("https://mobile.rhein-neckar-tango.de/event/101");
		expect(xml).toContain("https://mobile.rhein-neckar-tango.de/tanzraeume/studio-a");
		expect(xml).toContain("https://mobile.rhein-neckar-tango.de/veranstalter/rnt-ev");
		expect(xml).toContain("https://mobile.rhein-neckar-tango.de/djs/dj-anna");
	});
});
