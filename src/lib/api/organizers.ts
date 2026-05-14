/**
 * Organizer fetching from Tribe Organizers API.
 * Includes normalization, fetching, deduplication, and enhancement.
 */

import type { TribeOrganizer, EnhancedOrganizer, EventImage } from "$lib/types";
import {
	normalizeText,
	normalizeHtml,
	normalizeEventImage,
	normalizeWebsiteUrl,
} from "./normalizers";

const ORGANIZERS_API_BASE = "/api/organizers";

// --- Raw types ---

type RawTribeOrganizer = {
	id?: number | string;
	organizer?: string | null;
	slug?: string | null;
	url?: string | null;
	website?: string | null;
	email?: string | null;
	phone?: string | null;
	description?: string | null;
	image?: EventImage;
};

type OrganizersResponse = {
	organizers?: RawTribeOrganizer[];
	total_pages?: number | string;
};

// --- Normalization ---

export function normalizeOrganizer(
	organizer: RawTribeOrganizer,
): TribeOrganizer {
	const parsedId =
		typeof organizer.id === "string"
			? Number.parseInt(organizer.id, 10)
			: organizer.id;

	return {
		id: Number.isFinite(parsedId) ? Number(parsedId) : 0,
		organizer: normalizeText(organizer.organizer),
		slug: normalizeText(organizer.slug),
		url: normalizeText(organizer.url),
		website: normalizeWebsiteUrl(organizer.website),
		email: normalizeText(organizer.email),
		phone: normalizeText(organizer.phone),
		description: normalizeHtml(organizer.description),
		image: normalizeEventImage(organizer.image ?? false),
	};
}

// --- Fetching ---

export async function fetchOrganizers(
	fetcher: typeof fetch = fetch,
): Promise<TribeOrganizer[]> {
	const organizers: TribeOrganizer[] = [];
	const seenIds = new Set<number>();
	const perPage = 100;
	const maxPages = 30;

	for (let page = 1; page <= maxPages; page++) {
		const response = await fetcher(
			`${ORGANIZERS_API_BASE}?per_page=${perPage}&page=${page}`,
		);

		if (!response.ok) {
			if (page === 1) {
				return [];
			}
			break;
		}

		const data = (await response.json()) as OrganizersResponse;
		const pageOrganizers = (data.organizers ?? [])
			.map(normalizeOrganizer)
			.filter(
				(organizer) => organizer.id > 0 && organizer.organizer.length > 0,
			);

		for (const organizer of pageOrganizers) {
			if (seenIds.has(organizer.id)) continue;
			seenIds.add(organizer.id);
			organizers.push(organizer);
		}

		const totalPagesRaw =
			typeof data.total_pages === "string"
				? Number.parseInt(data.total_pages, 10)
				: data.total_pages;
		const totalPages = Number.isFinite(totalPagesRaw)
			? Number(totalPagesRaw)
			: null;

		if (
			pageOrganizers.length === 0 ||
			(totalPages !== null && page >= totalPages)
		) {
			break;
		}
	}

	return organizers;
}

// --- Enhancement helpers ---

type RawResponse = {
	_embedded?: Record<string, unknown>;
	acf?: Record<string, unknown>;
	date?: string;
	modified?: string;
};

function extractTagsFromRawData(rawData: RawResponse): string[] {
	if (!rawData._embedded?.["wp:term"]) return [];

	return (rawData._embedded["wp:term"] as unknown[])
		.flat()
		.filter((term: unknown) => {
			const t = term as Record<string, unknown>;
			return t.taxonomy === "post_tag";
		})
		.map((term: unknown) => (term as Record<string, unknown>).name as string);
}

function extractFeaturedImage(rawData: RawResponse): string | undefined {
	const embedded = rawData._embedded as Record<string, unknown> | undefined;
	const images = embedded?.["wp:featuredmedia"] as
		| { source_url?: string }[]
		| undefined;
	if (!images?.[0]?.source_url) return undefined;
	return images[0].source_url;
}

function checkVerificationStatus(rawData: RawResponse): boolean {
	return (rawData.acf?.rnt_verified as string | undefined) === "yes" || false;
}

// --- Enhanced fetching ---

export async function fetchEnhancedOrganizers(
	fetcher: typeof fetch = fetch,
): Promise<EnhancedOrganizer[]> {
	const basicOrganizers = await fetchOrganizers(fetcher);

	const enhancedOrganizers: EnhancedOrganizer[] = [];

	for (const organizer of basicOrganizers) {
		try {
			const response = await fetcher(
				`${ORGANIZERS_API_BASE}/${organizer.id}?_embed=wp:featuredmedia`,
			);
			if (!response.ok) continue;

			const rawData = (await response.json()) as RawResponse;
			const enhanced: EnhancedOrganizer = {
				...organizer,
				socialMedia: {
					website: organizer.website,
				},
				contact: {
					phone: organizer.phone,
					email: organizer.email,
				},
				details: {
					description: organizer.description,
					tags: extractTagsFromRawData(rawData),
				},
				media: {
					logo: extractFeaturedImage(rawData),
				},
				verification: {
					isVerified: checkVerificationStatus(rawData),
				},
			};

			enhancedOrganizers.push(enhanced);
		} catch {
			enhancedOrganizers.push({
				...organizer,
				contact: {
					phone: organizer.phone,
					email: organizer.email,
				},
			});
		}
	}

	return enhancedOrganizers;
}
