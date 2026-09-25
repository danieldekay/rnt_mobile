import { describe, expect, it } from "vitest";
import type { TribeEvent } from "$lib/types";
import { extractDjFromDescription } from "./djs";

function eventWithDescription(description: string): TribeEvent {
    return { description } as TribeEvent;
}

describe("extractDjFromDescription", () => {
    it("selects the DJ of event 141080 instead of the next milonga's DJ", () => {
        const event = eventWithDescription(`
            <div>wir laden Euch ein zur Milonga del Viernes am 15. September 2026 in der TAH Heidelberg mit DJane Alma Mia aus Halle.</div>
            <div>Nächste Milonga: 9. Oktober 2026 mit DJ Andy Ungureanu (Wiesbaden).</div>
            <div>Kurz &amp; Knapp</div>
            <div>Wann: 25.9.2026 ab 20:30 Uhr</div>
            <div>Musik: Alma Mia (Halle)</div>
        `);

        expect(extractDjFromDescription(event)).toBe("Alma Mia");
    });

    it("ignores a next-event announcement before the current DJ", () => {
        const event = eventWithDescription(`
            <div>Nächste Milonga: 9. Oktober mit DJ Andy Ungureanu (Wiesbaden).</div>
            <div>Kurz &amp; Knapp</div>
            <div>Heute mit DJane Alma Mia aus Halle.</div>
        `);

        expect(extractDjFromDescription(event)).toBe("Alma Mia");
    });

    it("ignores a next-event announcement that continues on the following line", () => {
        const event = eventWithDescription(`
            <div>Nächste Milonga:</div>
            <div>9. Oktober mit DJ Andy Ungureanu (Wiesbaden).</div>
            <div>Kurz &amp; Knapp</div>
            <div>Heute mit DJane Alma Mia aus Halle.</div>
        `);

        expect(extractDjFromDescription(event)).toBe("Alma Mia");
    });

    it("keeps the current DJ when the next event is mentioned on the same line", () => {
        const event = eventWithDescription(
            "Heute mit DJane Alma Mia aus Halle. Nächste Milonga mit DJ Andy Ungureanu.",
        );

        expect(extractDjFromDescription(event)).toBe("Alma Mia");
    });

    it("does not assign a DJ mentioned only for the next event", () => {
        const event = eventWithDescription(
            "<div>Nächste Milonga: 9. Oktober mit DJ Andy Ungureanu (Wiesbaden).</div>",
        );

        expect(extractDjFromDescription(event)).toBeNull();
    });

    it("keeps an ordinary current-event DJ", () => {
        const event = eventWithDescription("<div>Heute mit DJ Clara Sommer.</div>");

        expect(extractDjFromDescription(event)).toBe("Clara Sommer");
    });

    it("removes a trailing city from a current DJ name", () => {
        const event = eventWithDescription("<div>Heute mit DJ Andy Ungureanu (Wiesbaden).</div>");

        expect(extractDjFromDescription(event)).toBe("Andy Ungureanu");
    });

    it("returns the first current DJ when two are announced together", () => {
        const event = eventWithDescription("<div>DJs: Leilani Weiss & Max Mustermann</div>");

        expect(extractDjFromDescription(event)).toBe("Leilani Weiss");
    });
});
