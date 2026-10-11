import { describe, expect, it } from "vitest";
import { parseEventUrlState, writeEventUrlState } from "./url-state";

function parse(search: string) {
    return parseEventUrlState(new URLSearchParams(search));
}

describe("event URL state", () => {
    it("uses default list filters for an empty query string", () => {
        expect(parse("")).toEqual({
            filters: {
                date: "week",
                types: [],
                music: null,
                favoritesOnly: false,
            },
            searchQuery: "",
        });
    });

    it("parses date, category, music, favorites, and search state", () => {
        expect(
            parse(
                "date=month&types=workshop,milonga&music=neo&favorites=1&q=DJ%20Anna",
            ),
        ).toEqual({
            filters: {
                date: "month",
                types: ["milonga", "workshop"],
                music: "neo",
                favoritesOnly: true,
            },
            searchQuery: "DJ Anna",
        });
    });

    it("ignores invalid filter values and removes duplicate event types", () => {
        expect(
            parse("date=invalid&types=milonga,unknown,milonga&music=nope&favorites=false"),
        ).toEqual({
            filters: {
                date: "week",
                types: ["milonga"],
                music: null,
                favoritesOnly: false,
            },
            searchQuery: "",
        });
    });

    it("writes non-default state while preserving unrelated params", () => {
        const params = writeEventUrlState(new URLSearchParams("view=map"), {
            filters: {
                date: "all",
                types: ["kurs", "milonga"],
                music: "traditional",
                favoritesOnly: true,
            },
            searchQuery: " tangobar ",
        });

        expect(params.toString()).toBe(
            "view=map&date=all&types=milonga%2Ckurs&music=traditional&favorites=1&q=tangobar",
        );
    });

    it("removes default state from an existing query string", () => {
        const params = writeEventUrlState(
            new URLSearchParams(
                "view=calendar&date=all&types=milonga&music=mixed&favorites=1&q=test",
            ),
            {
                filters: {
                    date: "week",
                    types: [],
                    music: null,
                    favoritesOnly: false,
                },
                searchQuery: "",
            },
        );

        expect(params.toString()).toBe("view=calendar");
    });
});
