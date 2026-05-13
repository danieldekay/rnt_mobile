import { fetchAllEvents, fetchDjCptList } from "$lib/api/tribe";
import { getDjsFromCptAndEvents } from "$lib/utils/djs";
import type { DjProfileSummary } from "$lib/types";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 30);
    end.setHours(23, 59, 59, 999);

    const [cptDjs, events] = await Promise.all([
      fetchDjCptList(fetch),
      fetchAllEvents([], null, "all", fetch, undefined, { start, end }),
    ]);
    const djs = getDjsFromCptAndEvents(cptDjs, events);

    return {
      djs,
      loadError: false,
    };
  } catch (error) {
    console.error("Failed to load DJs:", error);

    return {
      djs: [] as DjProfileSummary[],
      loadError: true,
    };
  }
};
