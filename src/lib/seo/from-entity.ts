import type { TribeOrganizer, TribeVenue } from "$lib/types";

import { mapDjSeo, mapOrganizerSeo, mapVenueSeo } from "./pages";

type JsonLdCarrier = {
	json_ld?: Record<string, unknown>;
};

export function mapOrganizerDetailSeo(
	organizer: TribeOrganizer & JsonLdCarrier,
): ReturnType<typeof mapOrganizerSeo> {
	return mapOrganizerSeo(
		organizer.organizer,
		organizer.description,
		organizer.slug,
		organizer.json_ld,
	);
}

export function mapVenueDetailSeo(
	venue: TribeVenue & JsonLdCarrier,
	upcomingCount: number,
): ReturnType<typeof mapVenueSeo> {
	return mapVenueSeo(
		venue.venue,
		venue.city,
		venue.slug,
		upcomingCount,
		venue.json_ld,
	);
}

export function mapDjDetailSeo(name: string, slug: string, upcomingCount: number) {
	return mapDjSeo(name, slug, upcomingCount);
}
