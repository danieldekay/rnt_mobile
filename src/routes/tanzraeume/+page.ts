import { fetchAllEvents, fetchVenues } from "$lib/api/tribe";
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
  events: Awaited<ReturnType<typeof fetchAllEvents>>,
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
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 30);
    end.setHours(23, 59, 59, 999);

    const [venues, events] = await Promise.all([
      fetchVenues(fetch),
      fetchAllEvents([], null, "all", fetch, undefined, { start, end }),
    ]);
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
      loadError: false,
    };
  } catch (error) {
    console.error("Failed to load venues:", error);
    return {
      venues: [] as VenueWithUpcomingCount[],
      loadError: true,
    };
  }
};
