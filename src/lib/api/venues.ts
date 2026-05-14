/**
 * Venue fetching from Tribe Venues API.
 * Includes normalization, fetching, and enhancement with metadata.
 */

import type { TribeVenue, EnhancedVenue } from "$lib/types";
import { normalizeText, normalizeCoordinate } from "./normalizers";

const VENUES_API_BASE = "/api/venues";

// --- Raw types ---

type RawTribeVenue = {
	id?: number | string;
	venue?: string | null;
	address?: string | null;
	city?: string | null;
	geo_lat?: number | string | null;
	geo_lng?: number | string | null;
	website?: string | null;
};

type VenuesResponse = {
	venues?: RawTribeVenue[];
	total_pages?: number | string;
};

// --- Normalization ---

export function normalizeVenue(venue: RawTribeVenue): TribeVenue {
	const parsedId =
		typeof venue.id === "string" ? Number.parseInt(venue.id, 10) : venue.id;

	return {
		id: Number.isFinite(parsedId) ? Number(parsedId) : 0,
		venue: normalizeText(venue.venue),
		address: normalizeText(venue.address),
		city: normalizeText(venue.city),
		geo_lat: normalizeCoordinate(venue.geo_lat),
		geo_lng: normalizeCoordinate(venue.geo_lng),
		website: normalizeText(venue.website),
	};
}

// --- Fetching ---

export async function fetchVenues(
	fetcher: typeof fetch = fetch,
): Promise<TribeVenue[]> {
	const response = await fetcher(`${VENUES_API_BASE}?per_page=100`);

	if (!response.ok) {
		return [];
	}

	const data = (await response.json()) as VenuesResponse;
	return (data.venues ?? [])
		.map(normalizeVenue)
		.filter((venue) => venue.id > 0 && venue.venue.length > 0);
}

// --- Enhancement helpers ---

type OperatingHours = {
	monday?: string;
	tuesday?: string;
	wednesday?: string;
	thursday?: string;
	friday?: string;
	saturday?: string;
	sunday?: string;
	holidays?: string;
};

type RawResponse = {
	_embedded?: Record<string, unknown>;
	acf?: Record<string, unknown>;
	date?: string;
	modified?: string;
};

function extractTagsFromRawData(rawData: unknown): string[] {
	if (!(rawData instanceof Object) || rawData === null) return [];
	const obj = rawData as RawResponse;
	const embedded = obj._embedded as Record<string, unknown> | undefined;
	const terms = embedded?.["wp:term"] as Record<string, unknown>[] | undefined;
	if (!terms) return [];

	return terms
		.flat()
		.filter((term) => (term as Record<string, unknown>).taxonomy === "post_tag")
		.map((term) => (term as Record<string, unknown>).name as string);
}

function extractFeaturedImage(rawData: unknown): string | undefined {
	if (!(rawData instanceof Object) || rawData === null) return undefined;
	const obj = rawData as RawResponse;
	const embedded = obj._embedded as Record<string, unknown> | undefined;
	const images = embedded?.["wp:featuredmedia"] as
		| { source_url?: string }[]
		| undefined;
	if (!images?.[0]?.source_url) return undefined;
	return images[0].source_url;
}

function extractOperatingHours(rawData: unknown): OperatingHours | undefined {
	if (!(rawData instanceof Object) || rawData === null) return undefined;
	const obj = rawData as RawResponse;
	const acf = obj.acf as Record<string, unknown> | undefined;
	return (
		(acf?.rnt_oeffnungszeiten as OperatingHours | undefined) || {
			monday: "Geschlossen",
			tuesday: "Geschlossen",
			wednesday: "Geschlossen",
			thursday: "Geschlossen",
			friday: "Geschlossen",
			saturday: "Geschlossen",
			sunday: "Geschlossen",
		}
	);
}

function checkVerificationStatus(rawData: unknown): boolean {
	if (!(rawData instanceof Object) || rawData === null) return false;
	const obj = rawData as RawResponse;
	const acf = obj.acf as Record<string, unknown> | undefined;
	return (acf?.rnt_verified as string | undefined) === "yes" || false;
}

// --- Enhanced fetching ---

export async function fetchEnhancedVenues(
	fetcher: typeof fetch = fetch,
): Promise<EnhancedVenue[]> {
	const basicVenues = await fetchVenues(fetcher);

	const enhancedVenues: EnhancedVenue[] = [];

	for (const venue of basicVenues) {
		try {
			const response = await fetcher(
				`${VENUES_API_BASE}/${venue.id}?_embed=wp:featuredmedia`,
			);
			if (!response.ok) continue;

			const rawData = (await response.json()) as RawResponse;
			const enhanced: EnhancedVenue = {
				...venue,
				location: {
					address: venue.address,
					city: venue.city,
					coordinates:
						venue.geo_lat && venue.geo_lng
							? {
									latitude: venue.geo_lat,
									longitude: venue.geo_lng,
								}
							: undefined,
				},
				contact: {
					website: venue.website,
				},
				socialMedia: {
					website: venue.website,
				},
				media: {
					logo: extractFeaturedImage(rawData),
				},
				hours: extractOperatingHours(rawData),
				details: {
					tags: extractTagsFromRawData(rawData),
				},
				verification: {
					isVerified: checkVerificationStatus(rawData),
				},
			};

			enhancedVenues.push(enhanced);
		} catch {
			// Fall back to basic venue data
			enhancedVenues.push({
				...venue,
				location: {
					address: venue.address,
					city: venue.city,
					coordinates:
						venue.geo_lat && venue.geo_lng
							? {
									latitude: venue.geo_lat,
									longitude: venue.geo_lng,
								}
							: undefined,
				},
			});
		}
	}

	return enhancedVenues;
}
