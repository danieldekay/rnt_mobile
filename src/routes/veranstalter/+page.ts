import { fetchAllEvents, fetchOrganizers } from "$lib/api/tribe";
import type { OrganizerWithStats } from "$lib/types";
import {
  emptyDateFilterCounts,
  getMatchingDateFilters,
  getNextEventsForOrganizer,
  type DateFilterCounts,
} from "$lib/utils/date-filters";
import type { PageLoad } from "./$types";

type OrganizerStats = {
  upcomingCount: number;
  cityCounts: Map<string, number>;
  countsByDateFilter: DateFilterCounts;
};

function normalizeCity(city: string | null | undefined): string {
  const trimmed = (city ?? "").trim();
  return trimmed.length > 0 ? trimmed : "Unbekannt";
}

function deriveCityLabel(cityCounts: Map<string, number>): string {
  if (cityCounts.size === 0) return "Unbekannt";

  let bestCity = "Unbekannt";
  let bestCount = -1;

  for (const [city, count] of cityCounts) {
    if (
      count > bestCount ||
      (count === bestCount && city.localeCompare(bestCity, "de") < 0)
    ) {
      bestCity = city;
      bestCount = count;
    }
  }

  return bestCity;
}

function countStatsByOrganizerId(
  events: Awaited<ReturnType<typeof fetchAllEvents>>,
): Map<number, OrganizerStats> {
  const statsByOrganizer = new Map<number, OrganizerStats>();

  for (const event of events) {
    const organizers = event.organizer ?? [];
    if (organizers.length === 0) continue;

    const cityLabel = normalizeCity(event.venue?.city);
    const matchingDateFilters = getMatchingDateFilters(event.start_date);

    for (const organizer of organizers) {
      if (!organizer.id) continue;

      const existing = statsByOrganizer.get(organizer.id) ?? {
        upcomingCount: 0,
        cityCounts: new Map<string, number>(),
        countsByDateFilter: emptyDateFilterCounts(),
      };

      existing.upcomingCount += 1;

      if (cityLabel !== "Unbekannt") {
        existing.cityCounts.set(
          cityLabel,
          (existing.cityCounts.get(cityLabel) ?? 0) + 1,
        );
      }

      for (const filter of matchingDateFilters) {
        existing.countsByDateFilter[filter] += 1;
      }

      statsByOrganizer.set(organizer.id, existing);
    }
  }

  return statsByOrganizer;
}

function sortOrganizers(
  left: OrganizerWithStats,
  right: OrganizerWithStats,
): number {
  if (left.upcomingCount !== right.upcomingCount) {
    return right.upcomingCount - left.upcomingCount;
  }

  return left.organizer.localeCompare(right.organizer, "de");
}

export const load: PageLoad = async ({ fetch }) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 30);
    end.setHours(23, 59, 59, 999);

    const [organizers, events] = await Promise.all([
      fetchOrganizers(fetch),
      fetchAllEvents([], null, "all", fetch, undefined, { start, end }),
    ]);
    const statsByOrganizer = countStatsByOrganizerId(events);

    const organizersWithStats: OrganizerWithStats[] = organizers
      .map((organizer) => {
        const stats = statsByOrganizer.get(organizer.id) ?? {
          upcomingCount: 0,
          cityCounts: new Map<string, number>(),
          countsByDateFilter: emptyDateFilterCounts(),
        };

        return {
          ...organizer,
          upcomingCount: stats.upcomingCount,
          cityLabel: deriveCityLabel(stats.cityCounts),
          nextEvents: getNextEventsForOrganizer(events, organizer.id, 2),
          countsByDateFilter: stats.countsByDateFilter,
        };
      })
      .sort(sortOrganizers);

    return {
      organizers: organizersWithStats,
      loadError: false,
    };
  } catch (error) {
    console.error("Failed to load organizers:", error);

    return {
      organizers: [] as OrganizerWithStats[],
      loadError: true,
    };
  }
};
