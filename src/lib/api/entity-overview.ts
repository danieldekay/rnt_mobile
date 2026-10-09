import type {
    Category,
    DateDetails,
    Organizer,
    TribeEvent,
    Venue,
} from "$lib/types";
import { normalizeEvent } from "./normalizers";

type RawCategory = {
    id?: number;
    name?: string;
    slug?: string;
};

type RawVenue = {
    id?: number;
    venue?: string;
    city?: string;
};

type RawOrganizer = {
    id?: number;
    organizer?: string;
};

type RawEntityOverviewEvent = {
    id?: number;
    title?: string;
    description?: string;
    excerpt?: string;
    slug?: string;
    url?: string;
    image?: TribeEvent["image"];
    all_day?: boolean;
    start_date?: string;
    end_date?: string;
    categories?: RawCategory[];
    venue?: RawVenue | null;
    organizer?: RawOrganizer[];
};

export type EntityOverviewCoverage = {
    generatedAt: string;
    rangeStart: string;
    rangeEnd: string;
    pagesFetched: number;
    totalPages: number;
    truncated: boolean;
};

export type EntityOverviewResult = {
    events: TribeEvent[];
    coverage: EntityOverviewCoverage;
};

function dateDetails(value: string): DateDetails {
    const match = value.match(
        /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/,
    );

    return {
        year: match?.[1] ?? "",
        month: match?.[2] ?? "",
        day: match?.[3] ?? "",
        hour: match?.[4] ?? "00",
        minutes: match?.[5] ?? "00",
        seconds: match?.[6] ?? "00",
    };
}

function inflateCategory(category: RawCategory): Category {
    return {
        id: category.id ?? 0,
        name: category.name ?? "",
        slug: category.slug ?? "",
        description: "",
        count: 0,
    };
}

function inflateVenue(venue: RawVenue | null | undefined): Venue | null {
    if (!venue?.id) return null;

    return {
        id: venue.id,
        venue: venue.venue ?? "",
        address: "",
        city: venue.city ?? "",
        province: "",
        zip: "",
        country: "",
        geo_lat: 0,
        geo_lng: 0,
        website: "",
        phone: "",
    };
}

function inflateOrganizer(organizer: RawOrganizer): Organizer {
    return {
        id: organizer.id ?? 0,
        organizer: organizer.organizer ?? "",
        slug: "",
        url: "",
        website: "",
        email: "",
    };
}

function inflateEvent(raw: RawEntityOverviewEvent): TribeEvent {
    const startDate = raw.start_date ?? "";
    const endDate = raw.end_date ?? startDate;

    return normalizeEvent({
        id: raw.id ?? 0,
        title: raw.title ?? "",
        description: raw.description ?? "",
        excerpt: raw.excerpt ?? "",
        slug: raw.slug ?? "",
        url: raw.url ?? "",
        image: raw.image ?? false,
        all_day: raw.all_day ?? false,
        start_date: startDate,
        end_date: endDate,
        start_date_details: dateDetails(startDate),
        end_date_details: dateDetails(endDate),
        timezone: "Europe/Berlin",
        timezone_abbr: "",
        cost: "",
        cost_details: {
            currency_symbol: "€",
            currency_code: "EUR",
            currency_position: "suffix",
            values: [],
        },
        categories: (raw.categories ?? []).map(inflateCategory),
        venue: inflateVenue(raw.venue),
        organizer: (raw.organizer ?? []).map(inflateOrganizer),
        featured: false,
        sticky: false,
    });
}

export async function fetchEntityOverview(
    fetcher: typeof fetch = fetch,
): Promise<EntityOverviewResult> {
    const response = await fetcher("/api/entity-overview", {
        method: "GET",
        headers: { accept: "application/json" },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch entity overview: ${response.status}`);
    }

    const data = (await response.json()) as {
        generated_at?: string;
        range_start?: string;
        range_end?: string;
        pages_fetched?: number;
        total_pages?: number;
        truncated?: boolean;
        events?: RawEntityOverviewEvent[];
    };

    return {
        events: (data.events ?? []).map(inflateEvent),
        coverage: {
            generatedAt: data.generated_at ?? "",
            rangeStart: data.range_start ?? "",
            rangeEnd: data.range_end ?? "",
            pagesFetched: data.pages_fetched ?? 0,
            totalPages: data.total_pages ?? 0,
            truncated: data.truncated ?? false,
        },
    };
}
