import { fetchVenues } from "$lib/api/tribe";
import { fetchEntityOverview } from "$lib/api/entity-overview";
import type { TribeVenue } from "$lib/types";
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
  const dateLabel = startDate.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'short'
  });
  return {
    internalPath: `/event/${event.id}` as `/event/${number}`,
    externalUrl: event.url,
    title: event.title,
    dateLabel,
    city: event.venueCity ?? ''
  };
}

function countEventsPerVenueId(
  events: import("$lib/types").TribeEvent[],
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
      nextEvents: []
    };

    existing.upcomingCount += 1;
    for (const filter of getMatchingDateFilters(event.start_date)) {
      existing.countsByDateFilter[filter] += 1;
    }

    // Add next event (max 1 for venues)
    if (existing.nextEvents.length < 1) {
      existing.nextEvents.push(createVenueNextEventSummary({
        id: event.id,
        title: event.title,
        url: event.url,
        start_date: event.start_date,
        venueCity: event.venue?.city
      }));
    }

    counts.set(venueId, existing);
  }

  return counts;
}

export const load: PageLoad = async ({ fetch }) => {
  try {
    const [venues, overview] = await Promise.all([
      fetchVenues(fetch),
      fetchEntityOverview(fetch),
    ]);
    const events = overview.events;
    const countsByVenue = countEventsPerVenueId(events);

    const venuesWithCounts: VenueWithUpcomingCount[] = venues.map((venue) => {
      const stats = countsByVenue.get(venue.id) ?? {
        upcomingCount: 0,
        countsByDateFilter: emptyDateFilterCounts(),
        nextEvents: []
      };

      return {
        ...venue,
        upcomingCount: stats.upcomingCount,
        countsByDateFilter: stats.countsByDateFilter,
        nextEvents: stats.nextEvents.length > 0 ? stats.nextEvents : undefined,
      };
    });

    return {
      venues: venuesWithCounts,
      overviewCoverage: overview.coverage,
      loadError: false,
    };
  } catch (error) {
    console.error("Failed to load venues:", error);
    return {
      venues: [] as VenueWithUpcomingCount[],
      overviewCoverage: null,
      loadError: true,
    };
  }
};
