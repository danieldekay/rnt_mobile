import type { DateFilter, EventType, Filters, MusicType } from "$lib/types";

export interface EventUrlState {
    filters: Filters;
    searchQuery: string;
}

const DEFAULT_DATE_FILTER: DateFilter = "week";
const DATE_FILTERS = ["today", "week", "month", "all"] as const;
const EVENT_TYPES = ["milonga", "practica", "workshop", "kurs"] as const;
const MUSIC_TYPES = ["traditional", "mixed", "neo"] as const;

function isDateFilter(value: string | null): value is DateFilter {
    return value !== null && (DATE_FILTERS as readonly string[]).includes(value);
}

function isEventType(value: string): value is EventType {
    return (EVENT_TYPES as readonly string[]).includes(value);
}

function isMusicType(value: string | null): value is MusicType {
    return value !== null && (MUSIC_TYPES as readonly string[]).includes(value);
}

function parseTypes(value: string | null): EventType[] {
    if (!value) return [];

    const selected = new Set(
        value
            .split(",")
            .map((part) => part.trim())
            .filter(isEventType),
    );

    return EVENT_TYPES.filter((type) => selected.has(type));
}

function parseFavoritesOnly(value: string | null): boolean {
    return value === "1" || value === "true";
}

export function parseEventUrlState(params: URLSearchParams): EventUrlState {
    const dateValue = params.get("date");
    const musicValue = params.get("music");

    return {
        filters: {
            date: isDateFilter(dateValue) ? dateValue : DEFAULT_DATE_FILTER,
            types: parseTypes(params.get("types")),
            music: isMusicType(musicValue) ? musicValue : null,
            favoritesOnly: parseFavoritesOnly(params.get("favorites")),
        },
        searchQuery: params.get("q") ?? "",
    };
}

export function writeEventUrlState(
    params: URLSearchParams,
    state: EventUrlState,
): URLSearchParams {
    const next = new URLSearchParams(params);

    if (state.filters.date === DEFAULT_DATE_FILTER) {
        next.delete("date");
    } else {
        next.set("date", state.filters.date);
    }

    const orderedTypes = EVENT_TYPES.filter((type) =>
        state.filters.types.includes(type),
    );
    if (orderedTypes.length === 0) {
        next.delete("types");
    } else {
        next.set("types", orderedTypes.join(","));
    }

    if (state.filters.music === null) {
        next.delete("music");
    } else {
        next.set("music", state.filters.music);
    }

    if (state.filters.favoritesOnly) {
        next.set("favorites", "1");
    } else {
        next.delete("favorites");
    }

    const query = state.searchQuery.trim();
    if (query) {
        next.set("q", query);
    } else {
        next.delete("q");
    }

    return next;
}
