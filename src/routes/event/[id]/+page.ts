import { error } from "@sveltejs/kit";
import {
  EventFetchError,
  fetchEventById,
  fetchDjCptList,
} from "$lib/api/tribe";
import type { DjCptEntry } from "$lib/types";
import type { PageLoad } from "./$types";

const EVENT_DETAIL_API_BASE = "/api/events";

export const load: PageLoad = async ({ fetch, params }) => {
  const requestedEventId = Number.parseInt(params.id, 10);

  if (!Number.isInteger(requestedEventId) || requestedEventId <= 0) {
    throw error(404, "Veranstaltung nicht gefunden");
  }

  try {
    const event = await fetchEventById(
      requestedEventId,
      fetch,
      EVENT_DETAIL_API_BASE,
    );

    let cptDjs: DjCptEntry[] = [];
    try {
      cptDjs = await fetchDjCptList(fetch);
    } catch (djListError) {
      console.warn("DJ CPT list unavailable for event detail:", djListError);
    }

    return {
      event,
      requestedEventId,
      cptDjs,
    };
  } catch (loadError) {
    if (loadError instanceof EventFetchError && loadError.status === 404) {
      throw error(404, "Veranstaltung nicht gefunden");
    }

    console.error("Failed to load event detail:", loadError);
    throw error(500, "Laden fehlgeschlagen");
  }
};

export const prerender = false;
