/**
 * Venue presentation helpers – extracted from tanzraeume/+page.svelte
 */

import type { EnhancedVenue } from "$lib/types";

// --- Normalization helpers ---

export function normalizeCity(city: string): string {
	const trimmed = normalizeText(city);
	return trimmed.length > 0 ? trimmed : "Unbekannt";
}

export function normalizeText(value: string): string {
	return value.replace(/\s+/g, " ").trim();
}

export function normalizeForSearch(value: string): string {
	return normalizeText(value)
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLocaleLowerCase("de");
}

export function getWebsiteUrl(website: string): string | null {
	const trimmed = normalizeText(website);
	if (trimmed.length === 0) return null;
	const withScheme = /^[a-z]+:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

	try {
		return new URL(withScheme).toString();
	} catch {
		return null;
	}
}

export function getWebsiteHost(websiteUrl: string | null): string | null {
	if (websiteUrl === null) return null;

	try {
		return new URL(websiteUrl).hostname.replace(/^www\./, "").toLocaleLowerCase("de");
	} catch {
		return null;
	}
}

export function getAddressCore(address: string): string | null {
	const normalized = normalizeForSearch(address)
		.replace(/straße/g, "strasse")
		.replace(/[^a-z0-9\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();

	if (normalized.length === 0) return null;

	const parts = normalized.split(" ").filter((part) => part.length > 0);
	if (parts.length === 1) return parts[0];

	const lastPart = parts[parts.length - 1];
	const previousPart = parts[parts.length - 2];
	return /\d/.test(lastPart) ? `${previousPart} ${lastPart}`.trim() : parts.slice(-2).join(" ");
}

// --- Related venue detection ---

export interface VenueSearchIndex {
	cityLabel: string;
	addressCore: string | null;
	websiteHost: string | null;
}

export function isRelatedVenue(
	current: VenueSearchIndex,
	candidate: VenueSearchIndex,
): boolean {
	if (current.cityLabel !== candidate.cityLabel) return false;

	const sameWebsite =
		current.websiteHost !== null &&
		candidate.websiteHost !== null &&
		current.websiteHost === candidate.websiteHost;
	const sameAddressCore =
		current.addressCore !== null &&
		candidate.addressCore !== null &&
		current.addressCore === candidate.addressCore;

	return sameWebsite || sameAddressCore;
}

export function buildRelatedVenueLabel(
	relatedCount: number,
	sharesWebsite: boolean,
	sharesAddress: boolean,
	cityLabel: string,
): string | null {
	if (relatedCount === 0) return null;

	const countLabel = relatedCount === 1 ? "1 ähnlicher Eintrag" : `${relatedCount} ähnliche Einträge`;

	if (sharesWebsite && sharesAddress) {
		return `${countLabel} in ${cityLabel} mit gleicher Website und ähnlicher Adresse`;
	}

	if (sharesWebsite) {
		return `${countLabel} in ${cityLabel} mit gleicher Website`;
	}

	if (sharesAddress) {
		return `${countLabel} in ${cityLabel} mit ähnlicher Adresse`;
	}

	return `${countLabel} in ${cityLabel}`;
}

// --- Enhanced venue conversion ---

export function toEnhancedVenue(
	venue: any,
	nextEvents?: any[],
): EnhancedVenue {
	return {
		id: venue.id,
		venue: venue.venue,
		address: venue.address,
		city: venue.city,
		geo_lat: venue.geo_lat,
		geo_lng: venue.geo_lng,
		website: venue.website,
		upcomingCount: venue.upcomingCount,
		nextEvent: nextEvents?.[0]
			? {
					internalPath: nextEvents[0].internalPath,
					externalUrl: nextEvents[0].externalUrl,
					title: nextEvents[0].title,
					dateLabel: nextEvents[0].dateLabel,
					city: nextEvents[0].city,
			  }
			: undefined,
		location: {
			address: venue.address,
			city: venue.city,
		},
		details: {
			description: "",
		},
	};
}
