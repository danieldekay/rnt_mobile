import { describe, expect, it } from "vitest";
import { mapWordPressSeo } from "./from-wordpress";
import type { BlogPost } from "$lib/types";

const samplePost: BlogPost = {
	id: 130942,
	date: "2026-04-22T20:04:06",
	modified: "2026-04-22T20:04:07",
	slug: "rnt-community-survey-2026-ergebnisse",
	title: {
		rendered: "RNT Community Survey 2026 &#8212; Ergebnisse",
	},
	excerpt: {
		rendered:
			"<p>Was ich aus der RNT Community Survey 2026 mitnehme Ich habe in den letzten Wochen die RNT Community Survey 2026 ausgewertet.</p>",
	},
	content: {
		rendered: "<p>Survey body content for fallback description testing.</p>",
	},
	link: "https://www.rhein-neckar-tango.de/2026/04/22/rnt-community-survey-2026-ergebnisse/",
	categories: [1],
	yoast_head_json: {
		title:
			"RNT Community Survey 2026 -- Ergebnisse &#8211; Rhein-Neckar-Tango [RNT]",
		robots: {
			index: "index",
			follow: "follow",
			"max-snippet": "max-snippet:-1",
			"max-image-preview": "max-image-preview:large",
			"max-video-preview": "max-video-preview:-1",
		},
		canonical:
			"https://www.rhein-neckar-tango.de/2026/04/22/rnt-community-survey-2026-ergebnisse/",
		schema: {
			"@context": "https://schema.org",
			"@graph": [
				{
					"@type": "Article",
					headline: "RNT Community Survey 2026 &#8212; Ergebnisse",
				},
			],
		},
	},
};

describe("mapWordPressSeo", () => {
	it("maps Yoast title, canonical, robots, and JSON-LD", () => {
		const seo = mapWordPressSeo(samplePost, "Fallback title");

		expect(seo.title).toContain("RNT Community Survey 2026");
		expect(seo.title).toContain("Rhein-Neckar-Tango");
		expect(seo.canonical).toBe(
			"https://www.rhein-neckar-tango.de/2026/04/22/rnt-community-survey-2026-ergebnisse/",
		);
		expect(seo.robots).toContain("index");
		expect(seo.robots).toContain("follow");
		expect(seo.jsonLdScript).toContain('type="application/ld+json"');
		expect(seo.jsonLdScript).toContain('"@type":"Article"');
	});

	it("uses excerpt as description when Yoast has no description", () => {
		const seo = mapWordPressSeo(samplePost, "Fallback title");

		expect(seo.description).toContain("RNT Community Survey 2026");
		expect(seo.description).not.toContain("<p>");
	});

	it("falls back to post title when Yoast title is missing", () => {
		const seo = mapWordPressSeo(
			{
				...samplePost,
				yoast_head_json: undefined,
			},
			"Fallback title",
		);

		expect(seo.title).toContain("RNT Community Survey 2026");
		expect(seo.title).toContain("Ergebnisse");
	});
});
