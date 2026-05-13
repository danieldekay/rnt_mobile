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
    return {
      event: null,
      requestedEventId: null,
      loadError: "Ungültige Veranstaltungs-ID",
      cptDjs: [] as DjCptEntry[],
    };
  }

  try {
    const [event, cptDjs] = await Promise.all([
      fetchEventById(requestedEventId, fetch, EVENT_DETAIL_API_BASE),
      fetchDjCptList(fetch),
    ]);

    return {
      event,
      requestedEventId,
      loadError: null,
      cptDjs,
    };
  } catch (error) {
    if (error instanceof EventFetchError) {
      return {
        event: null,
        requestedEventId,
        loadError:
          error.status === 404
            ? "Veranstaltung nicht gefunden"
            : "Laden fehlgeschlagen",
        cptDjs: [] as DjCptEntry[],
      };
    }

    console.error("Failed to load event detail:", error);

    return {
      event: null,
      requestedEventId,
      loadError: "Laden fehlgeschlagen",
      cptDjs: [] as DjCptEntry[],
    };
  }
};

export const prerender = false;
