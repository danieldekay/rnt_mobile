import { extractDjFromDescription } from '$lib/api/tribe';
import type { TribeEvent } from '$lib/types';
import { getDjSlug } from '$lib/utils/djs';

export const FAVORITES_STORAGE_KEY = 'rnt-favorites';
export const FAVORITES_VERSION = 1;

export interface FavoritesSnapshot {
	version: number;
	eventIds: number[];
	eventSeriesSlugs: string[];
	organizerIds: number[];
	venueIds: number[];
	djSlugs: string[];
}

export function createEmptyFavorites(): FavoritesSnapshot {
	return {
		version: FAVORITES_VERSION,
		eventIds: [],
		eventSeriesSlugs: [],
		organizerIds: [],
		venueIds: [],
		djSlugs: []
	};
}

function uniqueNumbers(values: unknown): number[] {
	if (!Array.isArray(values)) return [];
	return [...new Set(values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value)))];
}

function uniqueStrings(values: unknown): string[] {
	if (!Array.isArray(values)) return [];
	return [...new Set(values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0))];
}

export function normalizeFavorites(value: unknown): FavoritesSnapshot {
	if (!value || typeof value !== 'object') {
		return createEmptyFavorites();
	}

	const candidate = value as Partial<FavoritesSnapshot>;
	const version = typeof candidate.version === 'number' ? candidate.version : 0;

	if (version > FAVORITES_VERSION) {
		return {
			version: FAVORITES_VERSION,
			eventIds: uniqueNumbers(candidate.eventIds),
			eventSeriesSlugs: uniqueStrings(candidate.eventSeriesSlugs),
			organizerIds: uniqueNumbers(candidate.organizerIds),
			venueIds: uniqueNumbers(candidate.venueIds),
			djSlugs: uniqueStrings(candidate.djSlugs)
		};
	}

	if (version < FAVORITES_VERSION) {
		return migrateFavorites(candidate);
	}

	return {
		version: FAVORITES_VERSION,
		eventIds: uniqueNumbers(candidate.eventIds),
		eventSeriesSlugs: uniqueStrings(candidate.eventSeriesSlugs),
		organizerIds: uniqueNumbers(candidate.organizerIds),
		venueIds: uniqueNumbers(candidate.venueIds),
		djSlugs: uniqueStrings(candidate.djSlugs)
	};
}

function migrateFavorites(candidate: Partial<FavoritesSnapshot>): FavoritesSnapshot {
	return {
		version: FAVORITES_VERSION,
		eventIds: uniqueNumbers(candidate.eventIds),
		eventSeriesSlugs: uniqueStrings(candidate.eventSeriesSlugs),
		organizerIds: uniqueNumbers(candidate.organizerIds),
		venueIds: uniqueNumbers(candidate.venueIds),
		djSlugs: uniqueStrings(candidate.djSlugs)
	};
}

export function serializeFavorites(snapshot: FavoritesSnapshot): string {
	return JSON.stringify(snapshot);
}

export function parseFavorites(raw: string | null): FavoritesSnapshot {
	if (!raw) return createEmptyFavorites();

	try {
		return normalizeFavorites(JSON.parse(raw));
	} catch {
		return createEmptyFavorites();
	}
}

export function isEventDirectlyFavorited(event: TribeEvent, favorites: FavoritesSnapshot): boolean {
	return (
		favorites.eventIds.includes(event.id) ||
		(Boolean(event.slug) && favorites.eventSeriesSlugs.includes(event.slug))
	);
}

export function getEventDjSlug(event: TribeEvent): string | null {
	const djName = extractDjFromDescription(event);
	if (!djName) return null;
	return getDjSlug(djName);
}

export function matchesFavoriteEvent(event: TribeEvent, favorites: FavoritesSnapshot): boolean {
	if (isEventDirectlyFavorited(event, favorites)) {
		return true;
	}

	if (event.organizer?.some((organizer) => favorites.organizerIds.includes(organizer.id))) {
		return true;
	}

	if (event.venue?.id && favorites.venueIds.includes(event.venue.id)) {
		return true;
	}

	const djSlug = getEventDjSlug(event);
	if (djSlug && favorites.djSlugs.includes(djSlug)) {
		return true;
	}

	return false;
}

export function hasAnyFavorites(favorites: FavoritesSnapshot): boolean {
	return (
		favorites.eventIds.length > 0 ||
		favorites.eventSeriesSlugs.length > 0 ||
		favorites.organizerIds.length > 0 ||
		favorites.venueIds.length > 0 ||
		favorites.djSlugs.length > 0
	);
}

export function getEventFavoriteState(
	event: TribeEvent,
	favorites: FavoritesSnapshot
): { isFavorite: boolean; isSingle: boolean; isSeries: boolean } {
	const isSingle = favorites.eventIds.includes(event.id);
	const isSeries = Boolean(event.slug) && favorites.eventSeriesSlugs.includes(event.slug);

	return {
		isFavorite: isSingle || isSeries,
		isSingle,
		isSeries
	};
}
