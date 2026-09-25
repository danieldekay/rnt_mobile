import { describe, expect, it } from "vitest";
import type { DjCptEntry, TribeEvent } from "$lib/types";
import { getDjProfileBySlug, getDjsFromCptAndEvents } from "./djs";

const dateDetails = {
    year: "2026", month: "09", day: "25", hour: "20", minutes: "30", seconds: "00",
};

const event: TribeEvent = {
    id: 141080,
    title: "Milonga del Viernes",
    description: `
        <div>Heute mit DJane Alma Mia aus Halle.</div>
        <div>Nächste Milonga: 9. Oktober mit DJ Andy Ungureanu (Wiesbaden).</div>
        <div>Kurz &amp; Knapp</div><div>Musik: Alma Mia (Halle)</div>
    `,
    excerpt: "",
    slug: "milonga-del-viernes",
    start_date: "2026-09-25 20:30:00",
    end_date: "2026-09-25 23:59:00",
    start_date_details: dateDetails,
    end_date_details: dateDetails,
    timezone: "Europe/Berlin",
    timezone_abbr: "CEST",
    url: "https://www.rhein-neckar-tango.de/veranstaltung/milonga-del-viernes-92-26/",
    image: false,
    all_day: false,
    cost: "",
    cost_details: { currency_symbol: "", currency_code: "", currency_position: "", values: [] },
    categories: [],
    venue: null,
    organizer: [],
    featured: false,
    sticky: false,
};

const cptDjs: DjCptEntry[] = [
    { id: 4590, slug: "andy-ungureanu", name: "Andy Ungureanu" },
];

describe("DJ event associations", () => {
    it("credits event 141080 to Alma Mia, not the next event's DJ", () => {
        const profiles = getDjsFromCptAndEvents(cptDjs, [event]);

        expect(profiles.find((dj) => dj.slug === "alma-mia")?.upcomingCount).toBe(1);
        expect(profiles.find((dj) => dj.slug === "andy-ungureanu")?.upcomingCount).toBe(0);
        expect(getDjProfileBySlug([event], "alma-mia", cptDjs)?.events.map((item) => item.id)).toEqual([141080]);
        expect(getDjProfileBySlug([event], "andy-ungureanu", cptDjs)?.events).toEqual([]);
    });
});
