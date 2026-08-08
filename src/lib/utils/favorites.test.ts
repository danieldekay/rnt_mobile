import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TribeEvent } from '$lib/types';
import {
	FAVORITES_STORAGE_KEY,
	createEmptyFavorites,
	getEventFavoriteState,
	hasAnyFavorites,
	matchesFavoriteEvent,
	normalizeFavorites,
	parseFavorites,
	serializeFavorites
} from '$lib/utils/favorites';

vi.mock('$lib/api/tribe', () => ({
	extractDjFromDescription: vi.fn((event: TribeEvent) => {
		if (event.description.includes('DJ Test')) return 'DJ Test';
		return '';
	})
}));

vi.mock('$lib/utils/djs', () => ({
	getDjSlug: vi.fn((name: string) => name.toLowerCase().replace(/\s+/g, '-'))
}));

function createEvent(overrides: Partial<TribeEvent> = {}): TribeEvent {
	return {
		id: 1,
		title: 'Milonga',
		description: '',
		excerpt: '',
		slug: 'milonga',
		url: 'https://example.com/event/1',
		image: false,
		all_day: false,
		start_date: '2026-08-10 20:00:00',
		end_date: '2026-08-10 23:00:00',
		start_date_details: {
			year: '2026',
			month: '08',
			day: '10',
			hour: '20',
			minutes: '00',
			seconds: '00'
		},
		end_date_details: {
			year: '2026',
			month: '08',
			day: '10',
			hour: '23',
			minutes: '00',
			seconds: '00'
		},
		timezone: 'Europe/Berlin',
		timezone_abbr: 'CEST',
		cost: '',
		cost_details: {
			currency_symbol: '€',
			currency_code: 'EUR',
			currency_position: 'prefix',
			values: []
		},
		categories: [],
		venue: null,
		organizer: [],
		featured: false,
		sticky: false,
		...overrides
	};
}

describe('favorites utils', () => {
	it('normalizes invalid payloads to empty favorites', () => {
		expect(normalizeFavorites(null)).toEqual(createEmptyFavorites());
		expect(normalizeFavorites({ version: 1, eventIds: ['bad', 2] })).toEqual({
			...createEmptyFavorites(),
			eventIds: [2]
		});
	});

	it('matches direct event favorites by id and series slug', () => {
		const event = createEvent({ id: 42, slug: 'wednesday-milonga' });
		const favorites = createEmptyFavorites();

		expect(matchesFavoriteEvent(event, favorites)).toBe(false);

		favorites.eventIds.push(42);
		expect(matchesFavoriteEvent(event, favorites)).toBe(true);

		favorites.eventIds = [];
		favorites.eventSeriesSlugs.push('wednesday-milonga');
		expect(matchesFavoriteEvent(event, favorites)).toBe(true);
	});

	it('matches linked organizer, venue, and dj favorites', () => {
		const event = createEvent({
			description: 'Mit DJ Test',
			organizer: [{ id: 7, organizer: 'Org', slug: 'org', url: '', website: '', email: '' }],
			venue: {
				id: 9,
				venue: 'Saal',
				address: '',
				city: 'Mannheim',
				province: '',
				zip: '',
				country: '',
				geo_lat: 0,
				geo_lng: 0,
				website: '',
				phone: ''
			}
		});

		const byOrganizer = { ...createEmptyFavorites(), organizerIds: [7] };
		const byVenue = { ...createEmptyFavorites(), venueIds: [9] };
		const byDj = { ...createEmptyFavorites(), djSlugs: ['dj-test'] };

		expect(matchesFavoriteEvent(event, byOrganizer)).toBe(true);
		expect(matchesFavoriteEvent(event, byVenue)).toBe(true);
		expect(matchesFavoriteEvent(event, byDj)).toBe(true);
	});

	it('reports event favorite state for single and series scopes', () => {
		const event = createEvent({ id: 5, slug: 'series-a' });
		const favorites = {
			...createEmptyFavorites(),
			eventIds: [5],
			eventSeriesSlugs: ['series-a']
		};

		expect(getEventFavoriteState(event, favorites)).toEqual({
			isFavorite: true,
			isSingle: true,
			isSeries: true
		});
	});

	it('serializes and parses favorites for reload persistence', () => {
		const snapshot = {
			...createEmptyFavorites(),
			eventIds: [1, 2],
			eventSeriesSlugs: ['milonga'],
			organizerIds: [3],
			venueIds: [4],
			djSlugs: ['dj-a']
		};

		const parsed = parseFavorites(serializeFavorites(snapshot));
		expect(parsed).toEqual(snapshot);
		expect(hasAnyFavorites(parsed)).toBe(true);
	});
});

describe('favorites storage round-trip', () => {
	const storage = new Map<string, string>();

	beforeEach(() => {
		storage.clear();
		vi.stubGlobal('localStorage', {
			getItem: (key: string) => storage.get(key) ?? null,
			setItem: (key: string, value: string) => {
				storage.set(key, value);
			},
			removeItem: (key: string) => {
				storage.delete(key);
			}
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('persists snapshot under stable storage key', async () => {
		const snapshot = {
			...createEmptyFavorites(),
			organizerIds: [99]
		};

		localStorage.setItem(FAVORITES_STORAGE_KEY, serializeFavorites(snapshot));
		const reloaded = parseFavorites(localStorage.getItem(FAVORITES_STORAGE_KEY));

		expect(reloaded.organizerIds).toEqual([99]);
	});
});
