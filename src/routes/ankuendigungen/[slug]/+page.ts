import { error } from "@sveltejs/kit";
import { fetchAnnouncementBySlug } from "$lib/api/posts";
import { fetchAllEvents, fetchOrganizers } from "$lib/api/tribe";
import type { BlogPost, TribeEvent, TribeOrganizer } from "$lib/types";
import type { PageLoad } from "./$types";

const EVENTS_API_BASE = "/api/events";
const WORDPRESS_ADMIN_BASE =
  "https://www.rhein-neckar-tango.de/wp-admin/post.php";

function parseDateValue(value: string | null | undefined): Date | null {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getRelevantDate(post: BlogPost): Date | null {
  return (
    parseDateValue(post.meta?.rnt_termin?.trim()) ?? parseDateValue(post.date)
  );
}

function parseNumericMetaId(
  value: number | string | null | undefined,
): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  return null;
}

function normalizeForMatch(value: string): string {
  return value
    .toLocaleLowerCase("de")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&amp;|&#038;|&/g, " und ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreTitleMatch(
  announcementTitle: string,
  eventTitle: string,
): number {
  const leftTokens = new Set(
    normalizeForMatch(announcementTitle)
      .split(" ")
      .filter((token) => token.length > 2),
  );
  const rightTokens = normalizeForMatch(eventTitle)
    .split(" ")
    .filter((token) => token.length > 2);

  let score = 0;
  for (const token of rightTokens) {
    if (leftTokens.has(token)) score += 1;
  }

  return score;
}

function findRelatedEvent(
  post: BlogPost,
  events: TribeEvent[],
  organizerId: number | null,
): TribeEvent | null {
  const explicitUrl = post.meta?.rnt_url?.trim();
  if (explicitUrl) {
    const exact = events.find((event) => event.url === explicitUrl);
    if (exact) return exact;
  }

  const organizerMatched =
    organizerId === null
      ? events
      : events.filter((event) =>
          event.organizer.some((organizer) => organizer.id === organizerId),
        );

  if (organizerMatched.length === 0) return null;
  if (organizerMatched.length === 1) return organizerMatched[0] ?? null;

  const postTitle = post.title.rendered;
  return (
    [...organizerMatched].sort((left, right) => {
      const scoreDelta =
        scoreTitleMatch(postTitle, right.title) -
        scoreTitleMatch(postTitle, left.title);
      if (scoreDelta !== 0) return scoreDelta;
      return left.start_date.localeCompare(right.start_date);
    })[0] ?? null
  );
}

function buildWordPressBackendUrl(postId: number): string {
  const url = new URL(WORDPRESS_ADMIN_BASE);
  url.searchParams.set("post", String(postId));
  url.searchParams.set("action", "edit");
  return url.toString();
}

export const load: PageLoad = async ({ fetch, params }) => {
  const requestedSlug = params.slug.trim();

  if (!requestedSlug) {
    throw error(404, "Ankuendigung nicht gefunden");
  }

  try {
    const post = (await fetchAnnouncementBySlug(
      requestedSlug,
      fetch,
    )) as BlogPost | null;

    if (!post) {
      throw error(404, "Ankuendigung nicht gefunden");
    }

    const organizerId = parseNumericMetaId(post.meta?.rnt_veranstalter);
    const relevantDate = getRelevantDate(post);
    const dateRange = relevantDate
      ? {
          start: new Date(
            relevantDate.getFullYear(),
            relevantDate.getMonth(),
            relevantDate.getDate(),
            0,
            0,
            0,
            0,
          ),
          end: new Date(
            relevantDate.getFullYear(),
            relevantDate.getMonth(),
            relevantDate.getDate(),
            23,
            59,
            59,
            999,
          ),
        }
      : undefined;

    const [events, organizers] = await Promise.all([
      dateRange
        ? fetchAllEvents([], null, "all", fetch, EVENTS_API_BASE, dateRange)
        : Promise.resolve([] as TribeEvent[]),
      organizerId !== null
        ? fetchOrganizers(fetch)
        : Promise.resolve([] as TribeOrganizer[]),
    ]);

    const relatedEvent = findRelatedEvent(post, events, organizerId);
    const relatedOrganizer =
      organizerId !== null
        ? organizers.find((organizer) => organizer.id === organizerId) ?? null
        : null;

    return {
      post,
      relatedEvent,
      relatedOrganizer,
      backendUrl: buildWordPressBackendUrl(post.id),
    };
  } catch (loadError) {
    if (
      typeof loadError === "object" &&
      loadError !== null &&
      "status" in loadError
    ) {
      throw loadError;
    }

    console.error("Failed to load announcement detail:", loadError);
    throw error(500, "Ankuendigung konnte nicht geladen werden");
  }
};

export const prerender = false;
