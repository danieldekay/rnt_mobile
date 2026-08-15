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
    const [event, cptDjs] = await Promise.all([
      fetchEventById(requestedEventId, fetch, EVENT_DETAIL_API_BASE),
      fetchDjCptList(fetch),
    ]);

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
