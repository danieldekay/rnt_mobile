import { extractDjFromDescription } from "$lib/api/tribe";
import { MUSIC_SLUGS } from "$lib/constants";
import { formatShortDate } from "$lib/utils/date-formatting";
import type {
    TribeEvent,
    DjStyleKey,
    DjStyleCounts,
    DjProfileSummary,
    DjNextEventSummary,
    EntityDateFilter,
    DjCptEntry,
} from "$lib/types";
import {
    emptyDateFilterCounts,
    getMatchingDateFilters,
} from "$lib/utils/date-filters";

type DjAccumulator = Omit<DjProfileSummary, "style" | "searchText"> & {
    nextEventTimestamp: number;
    nextEventTimestampsByDateFilter: Partial<Record<EntityDateFilter, number>>;
};

function emptyStyleCounts(): DjStyleCounts {
    return {
        traditional: 0,
        mixed: 0,
        neo: 0,
    };
}

function classifyStyle(counts: DjStyleCounts): DjStyleKey {
    const hasTraditional = counts.traditional > 0;
    const hasNeo = counts.neo > 0;
    const hasMixed = counts.mixed > 0;

    if (hasTraditional && hasNeo && !hasMixed) {
        return "fifty-fifty";
    }

    if (hasTraditional && !hasNeo && !hasMixed) {
        return "traditional";
    }

    if (hasNeo && !hasTraditional && !hasMixed) {
        return "neo";
    }

    return "mixed";
}

function stylePreferenceToKey(
    pref: DjProfileSummary["stylePreference"],
): DjStyleKey | null {
    switch (pref) {
        case "traditionell":
            return "traditional";
        case "non/neo":
            return "neo";
        case "gemischt":
            return "mixed";
        default:
            return null;
    }
}

function resolveStyle(
    styleCounts: DjStyleCounts,
    stylePreference: DjProfileSummary["stylePreference"],
): DjStyleKey {
    const fromEvents = classifyStyle(styleCounts);
    // If events gave us signal, trust them. Otherwise fall back to CPT metadata.
    const totalEventCounts =
        styleCounts.traditional + styleCounts.mixed + styleCounts.neo;
    if (totalEventCounts === 0 && stylePreference) {
        return stylePreferenceToKey(stylePreference) ?? fromEvents;
    }
    return fromEvents;
}

function normalizeDjName(name: string): string {
    return name.trim().replace(/\s+/g, " ");
}

export function getDjCptSlugByName(
    name: string,
    cptDjs: DjCptEntry[],
): string | null {
    const normalizedName = normalizeDjName(name).toLocaleLowerCase("de");
    if (!normalizedName) return null;

    for (const cpt of cptDjs) {
        const cptName = normalizeDjName(cpt.name).toLocaleLowerCase("de");
        if (cptName === normalizedName) {
            return cpt.slug;
        }
    }

    return null;
}

export function getDjSlug(name: string): string {
    const normalized = normalizeDjName(name)
        .toLocaleLowerCase("de")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/&/g, " und ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return normalized || "dj";
}

function normalizeDjSort(
    left: DjProfileSummary,
    right: DjProfileSummary,
): number {
    if (left.upcomingCount !== right.upcomingCount) {
        return right.upcomingCount - left.upcomingCount;
    }

    return left.name.localeCompare(right.name, "de");
}

function getEventTimestamp(startDate: string): number {
    const timestamp = Date.parse(startDate);
    return Number.isFinite(timestamp) ? timestamp : Number.POSITIVE_INFINITY;
}

function getEventInternalPath(event: TribeEvent): `/event/${number}` | null {
    if (Number.isInteger(event.id) && event.id > 0) {
        return `/event/${event.id}`;
    }

    return null;
}

function getNextEventCity(event: TribeEvent): string {
    return event.venue?.city?.trim() || event.venue?.venue?.trim() || "";
}

function buildSearchText(
    dj: Pick<DjProfileSummary, "name" | "nextEventTitle" | "nextEventCity">,
): string {
    return [dj.name, dj.nextEventTitle, dj.nextEventCity]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("de");
}

export function getDjsFromCptAndEvents(
    cptDjs: DjCptEntry[],
    events: TribeEvent[],
): DjProfileSummary[] {
    const djsBySlug = new Map<string, DjAccumulator>();

    // Build a name→slug lookup for CPT DJs
    const cptNameToSlug = new Map<string, string>();
    for (const cpt of cptDjs) {
        const normalized = normalizeDjName(cpt.name).toLocaleLowerCase("de");
        if (normalized) {
            cptNameToSlug.set(normalized, cpt.slug);
        }
    }

    function getDjImage(meta: DjCptEntry["meta_box"]): string | false {
        if (!meta?.dj_image) return false;
        if (typeof meta.dj_image === "string") return meta.dj_image;
        if (typeof meta.dj_image === "object") {
            const img = meta.dj_image;
            return img.url ?? img.sizes?.thumbnail?.url ?? img.sizes?.medium?.url ?? false;
        }
        return false;
    }

    // Seed with ALL CPT DJs (zeroed stats), keyed by canonical CPT slug
    for (const cptDj of cptDjs) {
        if (!cptDj.slug) continue;
        const meta = cptDj.meta_box;
        djsBySlug.set(cptDj.slug, {
            id: cptDj.slug,
            slug: cptDj.slug,
            name: cptDj.name,
            image: getDjImage(meta),
            bio: typeof meta?.rnt_biografie === "string" ? meta.rnt_biografie : undefined,
            city: typeof meta?.rnt_stadt === "string" ? meta.rnt_stadt : undefined,
            stylePreference: meta?.rnt_stil as DjProfileSummary["stylePreference"],
            upcomingCount: 0,
            styleCounts: emptyStyleCounts(),
            nextEventInternalPath: null,
            nextEventExternalUrl: null,
            nextEventTitle: "",
            nextEventDateLabel: "Termin offen",
            nextEventCity: "",
            countsByDateFilter: emptyDateFilterCounts(),
            nextEventsByDateFilter: {},
            nextEventTimestamp: Number.POSITIVE_INFINITY,
            nextEventTimestampsByDateFilter: {},
        });
    }

    // Enrich with event data
    for (const event of events) {
        const djName = extractDjFromDescription(event);
        if (!djName) continue;
        const normalizedName = normalizeDjName(djName);
        if (!normalizedName) continue;

        // Try to match by CPT name first, then fall back to computed slug
        const cptSlug = cptNameToSlug.get(normalizedName.toLocaleLowerCase("de"));
        const djSlug = cptSlug ?? getDjSlug(normalizedName);
        if (!djSlug) continue;

        const categorySlugs = event.categories?.map((c) => c.slug) ?? [];
        const hasTraditional = categorySlugs.includes(MUSIC_SLUGS.traditional);
        const hasMixed = categorySlugs.includes(MUSIC_SLUGS.mixed);
        const hasNeo = categorySlugs.includes(MUSIC_SLUGS.neo);
        const eventTimestamp = getEventTimestamp(event.start_date);
        const nextEventInternalPath = getEventInternalPath(event);
        const nextEventCity = getNextEventCity(event);
        const matchingDateFilters = getMatchingDateFilters(event.start_date);
        const nextEventSummary: DjNextEventSummary = {
            internalPath: nextEventInternalPath,
            externalUrl: nextEventInternalPath ? null : event.url,
            title: event.title,
            dateLabel: formatShortDate(event.start_date) || "Termin offen",
            city: nextEventCity,
        };

        let existing = djsBySlug.get(djSlug);
        if (!existing) {
            existing = {
                id: djSlug,
                slug: djSlug,
                name: normalizedName,
                image: typeof event.image === "string" ? event.image : false,
                upcomingCount: 0,
                styleCounts: emptyStyleCounts(),
                nextEventInternalPath,
                nextEventExternalUrl: nextEventInternalPath ? null : event.url,
                nextEventTitle: event.title,
                nextEventDateLabel: formatShortDate(event.start_date) || "Termin offen",
                nextEventCity,
                countsByDateFilter: emptyDateFilterCounts(),
                nextEventsByDateFilter: {},
                nextEventTimestamp: eventTimestamp,
                nextEventTimestampsByDateFilter: {},
            };
        }

        existing.upcomingCount += 1;
        if (!existing.image && typeof event.image === "string") {
            existing.image = event.image;
        }
        if (eventTimestamp < existing.nextEventTimestamp) {
            existing.nextEventTimestamp = eventTimestamp;
            existing.nextEventInternalPath = nextEventInternalPath;
            existing.nextEventExternalUrl = nextEventInternalPath ? null : event.url;
            existing.nextEventTitle = event.title;
            (existing.nextEventDateLabel =
                formatShortDate(event.start_date) || "Termin offen"),
                (existing.nextEventCity = nextEventCity);
        }
        if (hasTraditional) existing.styleCounts.traditional += 1;
        if (hasMixed) existing.styleCounts.mixed += 1;
        if (hasNeo) existing.styleCounts.neo += 1;

        for (const filter of matchingDateFilters) {
            existing.countsByDateFilter[filter] += 1;
            const prevTs =
                existing.nextEventTimestampsByDateFilter[filter] ??
                Number.POSITIVE_INFINITY;
            if (eventTimestamp < prevTs) {
                existing.nextEventTimestampsByDateFilter[filter] = eventTimestamp;
                existing.nextEventsByDateFilter[filter] = nextEventSummary;
            }
        }

        djsBySlug.set(djSlug, existing);
    }

    return Array.from(djsBySlug.values())
        .map(
            ({
                nextEventTimestamp: _ts,
                nextEventTimestampsByDateFilter: _ts2,
                ...dj
            }) => {
                const profile: Omit<DjProfileSummary, "searchText"> = {
                    ...dj,
                    style: resolveStyle(dj.styleCounts, dj.stylePreference),
                };
                return {
                    ...profile,
                    searchText: buildSearchText(profile),
                };
            },
        )
        .sort(normalizeDjSort);
}

export function getDjsFromEvents(events: TribeEvent[]): DjProfileSummary[] {
    const djsByName = new Map<string, DjAccumulator>();

    for (const event of events) {
        const djName = extractDjFromDescription(event);
        if (!djName) continue;

        const normalizedName = normalizeDjName(djName);
        if (!normalizedName) continue;

        const djSlug = getDjSlug(normalizedName);
        const categorySlugs =
            event.categories?.map((category) => category.slug) ?? [];
        const hasTraditional = categorySlugs.includes(MUSIC_SLUGS.traditional);
        const hasMixed = categorySlugs.includes(MUSIC_SLUGS.mixed);
        const hasNeo = categorySlugs.includes(MUSIC_SLUGS.neo);
        const eventTimestamp = getEventTimestamp(event.start_date);
        const nextEventInternalPath = getEventInternalPath(event);
        const nextEventCity = getNextEventCity(event);
        const matchingDateFilters = getMatchingDateFilters(event.start_date);
        const nextEventSummary: DjNextEventSummary = {
            internalPath: nextEventInternalPath,
            externalUrl: nextEventInternalPath ? null : event.url,
            title: event.title,
            dateLabel: formatShortDate(event.start_date) || "Termin offen",
            city: nextEventCity,
        };

        const existing = djsByName.get(djSlug) ?? {
            id: djSlug,
            slug: djSlug,
            name: normalizedName,
            image: typeof event.image === "string" ? event.image : false,
            upcomingCount: 0,
            styleCounts: emptyStyleCounts(),
            nextEventInternalPath,
            nextEventExternalUrl: nextEventInternalPath ? null : event.url,
            nextEventTitle: event.title,
            nextEventDateLabel: formatShortDate(event.start_date) || "Termin offen",
            nextEventCity,
            countsByDateFilter: emptyDateFilterCounts(),
            nextEventsByDateFilter: {},
            nextEventTimestamp: eventTimestamp,
            nextEventTimestampsByDateFilter: {},
        };

        existing.upcomingCount += 1;
        if (!existing.image && typeof event.image === "string") {
            existing.image = event.image;
        }
        if (eventTimestamp < existing.nextEventTimestamp) {
            existing.nextEventTimestamp = eventTimestamp;
            existing.nextEventInternalPath = nextEventInternalPath;
            existing.nextEventExternalUrl = nextEventInternalPath ? null : event.url;
            existing.nextEventTitle = event.title;
            (existing.nextEventDateLabel =
                formatShortDate(event.start_date) || "Termin offen"),
                (existing.nextEventCity = nextEventCity);
        }
        if (hasTraditional) existing.styleCounts.traditional += 1;
        if (hasMixed) existing.styleCounts.mixed += 1;
        if (hasNeo) existing.styleCounts.neo += 1;

        for (const filter of matchingDateFilters) {
            existing.countsByDateFilter[filter] += 1;

            const previousTimestamp =
                existing.nextEventTimestampsByDateFilter[filter] ??
                Number.POSITIVE_INFINITY;
            if (eventTimestamp < previousTimestamp) {
                existing.nextEventTimestampsByDateFilter[filter] = eventTimestamp;
                existing.nextEventsByDateFilter[filter] = nextEventSummary;
            }
        }

        djsByName.set(djSlug, existing);
    }

    return Array.from(djsByName.values())
        .map(
            ({
                nextEventTimestamp: _nextEventTimestamp,
                nextEventTimestampsByDateFilter: _timestamps,
                ...dj
            }) => {
                const profile: Omit<DjProfileSummary, "searchText"> = {
                    ...dj,
                    style: classifyStyle(dj.styleCounts),
                };

                return {
                    ...profile,
                    searchText: buildSearchText(profile),
                };
            },
        )
        .sort(normalizeDjSort);
}

export function getDjProfileBySlug(
    events: TribeEvent[],
    slug: string,
    cptDjs?: DjCptEntry[],
): { dj: DjProfileSummary; events: TribeEvent[] } | null {
    const normalizedSlug = slug.trim().toLocaleLowerCase("de");
    if (!normalizedSlug) return null;

    const djs = cptDjs
        ? getDjsFromCptAndEvents(cptDjs, events)
        : getDjsFromEvents(events);
    const dj = djs.find((entry) => entry.slug === normalizedSlug);
    if (!dj) return null;

    const djEvents = events
        .filter((event) => {
            const djName = extractDjFromDescription(event);
            return djName ? getDjSlug(djName) === normalizedSlug : false;
        })
        .sort((left, right) => left.start_date.localeCompare(right.start_date));

    return {
        dj,
        events: djEvents,
    };
}
