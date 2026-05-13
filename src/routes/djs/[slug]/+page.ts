import { error } from "@sveltejs/kit";
import { fetchAllEvents, fetchDjCptList, fetchDjCptBySlug } from "$lib/api/tribe";
import { getDjProfileBySlug } from "$lib/utils/djs";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, params }) => {
  const slug = params.slug.trim();

  if (!slug) {
    throw error(404, "DJ nicht gefunden");
  }

  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 30);
    end.setHours(23, 59, 59, 999);

    const [cptDj, cptDjs, events] = await Promise.all([
      fetchDjCptBySlug(slug, fetch),
      fetchDjCptList(fetch),
      fetchAllEvents([], null, "all", fetch, undefined, { start, end }),
    ]);
    const profile = getDjProfileBySlug(events, slug, cptDjs);

    if (!profile) {
      throw error(404, "DJ nicht gefunden");
    }

    return {
      dj: profile.dj,
      cptDj: cptDj,
      events: profile.events,
    };
  } catch (loadError) {
    if (
      typeof loadError === "object" &&
      loadError !== null &&
      "status" in loadError
    ) {
      throw loadError;
    }

    console.error("Failed to load DJ detail:", loadError);
    throw error(500, "DJ-Profil konnte nicht geladen werden");
  }
};

export const prerender = false;
