import { error } from "@sveltejs/kit";
import { fetchAllEvents, fetchVenues } from "$lib/api/tribe";
import type { TribeEvent, TribeVenue } from "$lib/types";
import {
  emptyDateFilterCounts,
  getMatchingDateFilters,
  type DateFilterCounts,
} from "$lib/utils/date-filters";
import type { PageLoad } from "./$types";

type VenueNextEvent = {
  internalPath: `/event/${number}` | null;
  externalUrl: string | null;
  title: string;
  dateLabel: string;
  city: string;
};

type VenueWithUpcomingCount = TribeVenue & {
  upcomingCount: number;
  countsByDateFilter: DateFilterCounts;
  nextEvents?: VenueNextEvent[];
};

function createVenueNextEventSummary(event: {
  id: number;
  title: string;
  url: string;
  start_date: string;
  venueCity?: string;
}): VenueNextEvent {
  const startDate = new Date(event.start_date);
  const dateLabel = startDate.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
  });
  return {
    internalPath: `/event/${event.id}` as `/event/${number}`,
    externalUrl: event.url,
    title: event.title,
    dateLabel,
    city: event.venueCity ?? "",
  };
}

function countEventsPerVenueId(
  events: TribeEvent[],
): Map<
  number,
  { upcomingCount: number; countsByDateFilter: DateFilterCounts; nextEvents: VenueNextEvent[] }
> {
  const counts = new Map<
    number,
    { upcomingCount: number; countsByDateFilter: DateFilterCounts; nextEvents: VenueNextEvent[] }
  >();

  for (const event of events) {
    const venueId = event.venue?.id;
    if (!venueId) continue;

    const existing = counts.get(venueId) ?? {
      upcomingCount: 0,
      countsByDateFilter: emptyDateFilterCounts(),
      nextEvents: [],
    };

    existing.upcomingCount += 1;
    for (const filter of getMatchingDateFilters(event.start_date)) {
      existing.countsByDateFilter[filter] += 1;
    }

    if (existing.nextEvents.length < 3) {
      existing.nextEvents.push(
        createVenueNextEventSummary({
          id: event.id,
          title: event.title,
          url: event.url,
          start_date: event.start_date,
          venueCity: event.venue?.city,
        }),
      );
    }

    counts.set(venueId, existing);
  }

  return counts;
}

export const load: PageLoad = async ({ fetch, params }) => {
  const slug = params.slug.trim();
  if (!slug) {
    throw error(404, "Tanzraum nicht gefunden");
  }

  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    end.setHours(23, 59, 59, 999);

    const [venues, events] = await Promise.all([
      fetchVenues(fetch),
      fetchAllEvents([], null, "all", fetch, undefined, { start, end }),
    ]);

    const venue = venues.find((entry) => entry.slug === slug);
    if (!venue) {
      throw error(404, "Tanzraum nicht gefunden");
    }

    const countsByVenue = countEventsPerVenueId(events);
    const stats = countsByVenue.get(venue.id) ?? {
      upcomingCount: 0,
      countsByDateFilter: emptyDateFilterCounts(),
      nextEvents: [],
    };

    const venueEvents = events.filter((event) => event.venue?.id === venue.id);

    const venueDetail: VenueWithUpcomingCount = {
      ...venue,
      upcomingCount: stats.upcomingCount,
      countsByDateFilter: stats.countsByDateFilter,
      nextEvents: stats.nextEvents.length > 0 ? stats.nextEvents : undefined,
    };

    return {
      venue: venueDetail,
      events: venueEvents,
    };
  } catch (loadError) {
    if (
      typeof loadError === "object" &&
      loadError !== null &&
      "status" in loadError
    ) {
      throw loadError;
    }

    console.error("Failed to load venue detail:", loadError);
    throw error(500, "Tanzraum konnte nicht geladen werden");
  }
};

export const prerender = false;
