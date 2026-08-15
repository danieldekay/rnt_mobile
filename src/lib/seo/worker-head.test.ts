import { describe, expect, it } from "vitest";

import { isHtmlDocumentRequest, resolveSeoForPath } from "./worker-head";

describe("isHtmlDocumentRequest", () => {
	it("accepts navigation requests with text/html", () => {
		const request = new Request("https://mobile.rhein-neckar-tango.de/event/1", {
			headers: { accept: "text/html,application/xhtml+xml" },
		});

		expect(isHtmlDocumentRequest(request)).toBe(true);
	});

	it("accepts generic */* accept headers", () => {
		const request = new Request("https://mobile.rhein-neckar-tango.de/event/1", {
			headers: { accept: "*/*" },
		});

		expect(isHtmlDocumentRequest(request)).toBe(true);
	});

	it("rejects JSON-only API requests", () => {
		const request = new Request("https://mobile.rhein-neckar-tango.de/api/events/1", {
			headers: { accept: "application/json" },
		});

		expect(isHtmlDocumentRequest(request)).toBe(false);
	});
});

describe("resolveSeoForPath", () => {
	it("fetches event SEO from the Tribe API directly", async () => {
		const fetcher = async (input: string | URL | Request) => {
			const url = String(input);
			if (url.endsWith("/events/10030955")) {
				return Response.json({
					id: 10030955,
					title: "Tango Body Training",
					start_date: "2026-08-15 19:30:00",
					end_date: "2026-08-15 21:00:00",
					all_day: false,
					description: "",
					excerpt: "",
					categories: [{ id: 1, name: "Workshop", slug: "typ_workshop", description: "", count: 1 }],
					venue: { id: 1, venue: "Studio", slug: "studio", city: "Heidelberg" },
					organizer: [{ id: 2, organizer: "RNT", slug: "rnt" }],
					json_ld: { "@type": "Event", url: "https://www.example.com/event" },
				});
			}
			return new Response(null, { status: 404 });
		};

		const result = await resolveSeoForPath("/event/10030955", fetcher, {
			tribeEventsBaseUrl: "https://www.rhein-neckar-tango.de/wp-json/tribe/events/v1/events",
			tribeVenuesBaseUrl: "https://www.rhein-neckar-tango.de/wp-json/tribe/events/v1/venues",
			tribeOrganizersBaseUrl: "https://www.rhein-neckar-tango.de/wp-json/tribe/events/v1/organizers",
		});

		expect(result.seo?.title).toContain("Tango Body Training");
		expect(result.seo?.canonical).toBe(
			"https://mobile.rhein-neckar-tango.de/event/10030955",
		);
	});
});
