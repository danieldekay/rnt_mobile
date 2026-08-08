import { browser } from '$app/environment';
import { trackFeatureEvent } from '$lib/matomo';
import type { TribeEvent } from '$lib/types';
import {
	FAVORITES_STORAGE_KEY,
	FAVORITES_VERSION,
	createEmptyFavorites,
	getEventFavoriteState,
	matchesFavoriteEvent,
	normalizeFavorites,
	type FavoritesSnapshot
} from '$lib/utils/favorites';

function createFavoritesStore() {
	let snapshot = $state<FavoritesSnapshot>(createEmptyFavorites());
	let ready = $state(false);

	function persist() {
		if (!browser) return;
		localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(snapshot));
	}

	function setSnapshot(next: FavoritesSnapshot) {
		snapshot = next;
		persist();
	}

	function load() {
		if (!browser) {
			ready = true;
			return;
		}

		try {
			const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
			snapshot = raw ? normalizeFavorites(JSON.parse(raw)) : createEmptyFavorites();
		} catch {
			snapshot = createEmptyFavorites();
		}

		ready = true;
	}

	function addEventSingle(eventId: number) {
		if (snapshot.eventIds.includes(eventId)) return;
		setSnapshot({
			...snapshot,
			version: FAVORITES_VERSION,
			eventIds: [...snapshot.eventIds, eventId]
		});
		trackFeatureEvent('favorites', 'add_event_single', String(eventId));
	}

	function addEventSeries(slug: string) {
		if (!slug || snapshot.eventSeriesSlugs.includes(slug)) return;
		setSnapshot({
			...snapshot,
			version: FAVORITES_VERSION,
			eventSeriesSlugs: [...snapshot.eventSeriesSlugs, slug]
		});
		trackFeatureEvent('favorites', 'add_event_series', slug);
	}

	function removeEventSingle(eventId: number) {
		if (!snapshot.eventIds.includes(eventId)) return;
		setSnapshot({
			...snapshot,
			version: FAVORITES_VERSION,
			eventIds: snapshot.eventIds.filter((id) => id !== eventId)
		});
		trackFeatureEvent('favorites', 'remove_event_single', String(eventId));
	}

	function removeEventSeries(slug: string) {
		if (!slug || !snapshot.eventSeriesSlugs.includes(slug)) return;
		setSnapshot({
			...snapshot,
			version: FAVORITES_VERSION,
			eventSeriesSlugs: snapshot.eventSeriesSlugs.filter((value) => value !== slug)
		});
		trackFeatureEvent('favorites', 'remove_event_series', slug);
	}

	function removeEvent(event: TribeEvent) {
		const state = getEventFavoriteState(event, snapshot);
		if (state.isSingle) removeEventSingle(event.id);
		if (state.isSeries && event.slug) removeEventSeries(event.slug);
	}

	function toggleOrganizer(organizerId: number) {
		const includes = snapshot.organizerIds.includes(organizerId);
		setSnapshot({
			...snapshot,
			version: FAVORITES_VERSION,
			organizerIds: includes
				? snapshot.organizerIds.filter((id) => id !== organizerId)
				: [...snapshot.organizerIds, organizerId]
		});
		trackFeatureEvent('favorites', includes ? 'remove_organizer' : 'add_organizer', String(organizerId));
	}

	function toggleVenue(venueId: number) {
		const includes = snapshot.venueIds.includes(venueId);
		setSnapshot({
			...snapshot,
			version: FAVORITES_VERSION,
			venueIds: includes
				? snapshot.venueIds.filter((id) => id !== venueId)
				: [...snapshot.venueIds, venueId]
		});
		trackFeatureEvent('favorites', includes ? 'remove_venue' : 'add_venue', String(venueId));
	}

	function toggleDj(djSlug: string) {
		if (!djSlug) return;
		const includes = snapshot.djSlugs.includes(djSlug);
		setSnapshot({
			...snapshot,
			version: FAVORITES_VERSION,
			djSlugs: includes
				? snapshot.djSlugs.filter((slug) => slug !== djSlug)
				: [...snapshot.djSlugs, djSlug]
		});
		trackFeatureEvent('favorites', includes ? 'remove_dj' : 'add_dj', djSlug);
	}

	function isOrganizerFavorite(organizerId: number): boolean {
		return snapshot.organizerIds.includes(organizerId);
	}

	function isVenueFavorite(venueId: number): boolean {
		return snapshot.venueIds.includes(venueId);
	}

	function isDjFavorite(djSlug: string): boolean {
		return snapshot.djSlugs.includes(djSlug);
	}

	function matchesEvent(event: TribeEvent): boolean {
		return matchesFavoriteEvent(event, snapshot);
	}

	function getEventState(event: TribeEvent) {
		return getEventFavoriteState(event, snapshot);
	}

	load();

	return {
		get ready() {
			return ready;
		},
		get snapshot() {
			return snapshot;
		},
		addEventSingle,
		addEventSeries,
		removeEvent,
		removeEventSingle,
		removeEventSeries,
		toggleOrganizer,
		toggleVenue,
		toggleDj,
		isOrganizerFavorite,
		isVenueFavorite,
		isDjFavorite,
		matchesEvent,
		getEventState
	};
}

export const favoritesStore = createFavoritesStore();
