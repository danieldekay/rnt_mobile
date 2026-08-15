import { describe, expect, it } from "vitest";

import type { TribeEvent } from "$lib/types";

import { buildEventDescription, isEventExpired, mapEventSeo } from "./from-event";

const baseEvent = {
	id: 12345,
	title: "Milonga Heidelberg",
	start_date: "2026-08-21 20:00:00",
	end_date: "2026-08-21 23:30:00",
	all_day: false,
	description: "<p>Freitagsmilonga im Herzen von Heidelberg.</p>",
	excerpt: "",
	venue: {
		id: 1,
		venue: "Tango Studio",
		slug: "tango-studio",
		city: "Heidelberg",
	},
	organizer: [{ id: 2, organizer: "RNT e.V.", slug: "rnt-ev" }],
	categories: [{ id: 1, name: "Milonga", slug: "typ_milonga", description: "", count: 1 }],
	json_ld: {
		"@context": "https://schema.org",
		"@type": "Event",
		"@id": "https://www.rhein-neckar-tango.de/veranstaltung/milonga-heidelberg/",
		name: "Milonga Heidelberg",
		url: "https://www.rhein-neckar-tango.de/veranstaltung/milonga-heidelberg/",
	},
} as unknown as TribeEvent;

describe("mapEventSeo", () => {
	it("builds unique title, canonical, and description", () => {
		const seo = mapEventSeo(baseEvent, new Date("2026-08-01T12:00:00Z"));

		expect(seo.title).toBe(
			"Milonga Heidelberg – 21. August 2026 | Rhein-Neckar-Tango",
		);
		expect(seo.canonical).toBe("https://mobile.rhein-neckar-tango.de/event/12345");
		expect(seo.description).toContain("Milonga");
		expect(seo.description).toContain("Heidelberg");
		expect(seo.description).toContain("RNT e.V.");
	});

	it("overlays Tribe json_ld url to mobile permalink", () => {
		const seo = mapEventSeo(baseEvent, new Date("2026-08-01T12:00:00Z"));

		expect(seo.jsonLd).toMatchObject({
			"@type": "DanceEvent",
			url: "https://mobile.rhein-neckar-tango.de/event/12345",
			"@id": "https://mobile.rhein-neckar-tango.de/event/12345",
		});
	});

	it("marks expired events as noindex", () => {
		const seo = mapEventSeo(baseEvent, new Date("2026-09-01T12:00:00Z"));

		expect(seo.robots).toBe("noindex, follow");
		expect(isEventExpired(baseEvent, new Date("2026-09-01T12:00:00Z"))).toBe(true);
	});
});

describe("buildEventDescription", () => {
	it("includes date, venue, and organizer", () => {
		const description = buildEventDescription(baseEvent);

		expect(description).toContain("21. August 2026");
		expect(description).toContain("Tango Studio");
		expect(description).toContain("RNT e.V.");
	});
});
