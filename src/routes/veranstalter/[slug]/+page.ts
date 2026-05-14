import { error } from "@sveltejs/kit";
import { fetchOrganizerEvents, fetchOrganizers } from "$lib/api/tribe";
import { getNextEventsForOrganizer } from "$lib/utils/date-filters";
import type { TribeOrganizer } from "$lib/types";
import type { PageLoad } from "./$types";

const WORDPRESS_ADMIN_BASE =
  "https://www.rhein-neckar-tango.de/wp-admin/post.php";

type OrganizerDetail = TribeOrganizer & {
  cityLabel: string;
  upcomingCount: number;
  nextEvents: import("$lib/types").OrganizerNextEventSummary[];
};

function normalizeCity(city: string | null | undefined): string {
  const trimmed = (city ?? "").trim();
  return trimmed.length > 0 ? trimmed : "Unbekannt";
}

function deriveCityLabel(events: import("$lib/types").TribeEvent[]): string {
  const counts = new Map<string, number>();

  for (const event of events) {
    const city = normalizeCity(event.venue?.city);
    if (city === "Unbekannt") continue;
    counts.set(city, (counts.get(city) ?? 0) + 1);
  }

  let bestCity = "Unbekannt";
  let bestCount = -1;
  for (const [city, count] of counts) {
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

function buildWordPressBackendUrl(postId: number): string {
  const url = new URL(WORDPRESS_ADMIN_BASE);
  url.searchParams.set("post", String(postId));
  url.searchParams.set("action", "edit");
  return url.toString();
}

export const load: PageLoad = async ({ fetch, params }) => {
  const slug = params.slug.trim();

  if (!slug) {
    throw error(404, "Veranstalter nicht gefunden");
  }

  try {
    const organizers = await fetchOrganizers(fetch);

    const organizer = organizers.find((entry) => entry.slug === slug) ?? null;
    if (!organizer) {
      throw error(404, "Veranstalter nicht gefunden");
    }

    const organizerEvents = await fetchOrganizerEvents(organizer.id, fetch);

    const organizerDetail: OrganizerDetail = {
      ...organizer,
      cityLabel: deriveCityLabel(organizerEvents),
      upcomingCount: organizerEvents.length,
      nextEvents: getNextEventsForOrganizer(organizerEvents, organizer.id, 2),
    };

    return {
      organizer: organizerDetail,
      events: organizerEvents,
      backendUrl: buildWordPressBackendUrl(organizer.id),
    };
  } catch (loadError) {
    if (
      typeof loadError === "object" &&
      loadError !== null &&
      "status" in loadError
    ) {
      throw loadError;
    }

    console.error("Failed to load organizer detail:", loadError);
    throw error(500, "Veranstalterprofil konnte nicht geladen werden");
  }
};

export const prerender = false;
