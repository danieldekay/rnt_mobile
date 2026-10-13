import { describe, expect, it } from "vitest";
import { parseDjUrlState, writeDjUrlState } from "./url-state";

function parse(search: string) {
    return parseDjUrlState(new URLSearchParams(search));
}

describe("DJ URL state", () => {
    it("uses default filters for an empty query string", () => {
        expect(parse("")).toEqual({
            activeDateFilter: "current-month",
            activeStyle: null,
            searchQuery: "",
        });
    });

    it("parses period, style, and search state", () => {
        expect(parse("period=next-3-months&style=traditional&q=Anna")).toEqual({
            activeDateFilter: "next-3-months",
            activeStyle: "traditional",
            searchQuery: "Anna",
        });
    });

    it("ignores invalid filter values", () => {
        expect(parse("period=soon&style=electro&q=Test")).toEqual({
            activeDateFilter: "current-month",
            activeStyle: null,
            searchQuery: "Test",
        });
    });

    it("writes non-default state while preserving unrelated params", () => {
        const params = writeDjUrlState(new URLSearchParams("view=compact"), {
            activeDateFilter: "next-7-days",
            activeStyle: "neo",
            searchQuery: "  dj test  ",
        });

        expect(params.toString()).toBe("view=compact&period=next-7-days&style=neo&q=dj+test");
    });

    it("removes default state from an existing query string", () => {
        const params = writeDjUrlState(
            new URLSearchParams("period=all&style=mixed&q=test&debug=1"),
            {
                activeDateFilter: "current-month",
                activeStyle: null,
                searchQuery: "",
            },
        );

        expect(params.toString()).toBe("debug=1");
    });
});
