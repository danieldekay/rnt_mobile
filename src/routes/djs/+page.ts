import { fetchDjCptList } from "$lib/api/tribe";
import { fetchEntityOverview } from "$lib/api/entity-overview";
import { getDjsFromCptAndEvents } from "$lib/utils/djs";
import type { DjProfileSummary } from "$lib/types";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  try {
    const [cptDjs, overview] = await Promise.all([
      fetchDjCptList(fetch),
      fetchEntityOverview(fetch),
    ]);
    const djs = getDjsFromCptAndEvents(cptDjs, overview.events);

    return {
      djs,
      overviewCoverage: overview.coverage,
      loadError: false,
    };
  } catch (error) {
    console.error("Failed to load DJs:", error);

    return {
      djs: [] as DjProfileSummary[],
      overviewCoverage: null,
      loadError: true,
    };
  }
};
