import type { DjStyleKey, EntityDateFilter } from "$lib/types";

export interface DjUrlState {
    activeDateFilter: EntityDateFilter;
    activeStyle: DjStyleKey | null;
    searchQuery: string;
}

const DEFAULT_DATE_FILTER: EntityDateFilter = "current-month";
const DATE_FILTERS = ["all", "next-7-days", "current-month", "next-3-months"] as const;
const STYLE_FILTERS = ["traditional", "neo", "fifty-fifty", "mixed"] as const;

function isEntityDateFilter(value: string | null): value is EntityDateFilter {
    return value !== null && (DATE_FILTERS as readonly string[]).includes(value);
}

function isDjStyleKey(value: string | null): value is DjStyleKey {
    return value !== null && (STYLE_FILTERS as readonly string[]).includes(value);
}

export function parseDjUrlState(params: URLSearchParams): DjUrlState {
    const periodValue = params.get("period");
    const styleValue = params.get("style");

    return {
        activeDateFilter: isEntityDateFilter(periodValue)
            ? periodValue
            : DEFAULT_DATE_FILTER,
        activeStyle: isDjStyleKey(styleValue) ? styleValue : null,
        searchQuery: params.get("q") ?? "",
    };
}

export function writeDjUrlState(
    params: URLSearchParams,
    state: DjUrlState,
): URLSearchParams {
    const next = new URLSearchParams(params);

    if (state.activeDateFilter === DEFAULT_DATE_FILTER) {
        next.delete("period");
    } else {
        next.set("period", state.activeDateFilter);
    }

    if (state.activeStyle === null) {
        next.delete("style");
    } else {
        next.set("style", state.activeStyle);
    }

    const query = state.searchQuery.trim();
    if (query) {
        next.set("q", query);
    } else {
        next.delete("q");
    }

    return next;
}
