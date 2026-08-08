import { screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import type { TribeEvent } from '$lib/types';

import { renderComponent } from '../../test/render';
import EventCard from './EventCard.svelte';

vi.mock('$app/paths', () => ({
	resolve: (path: string) => path
}));

vi.mock('$lib/stores/favorites.svelte', () => ({
	favoritesStore: {
		getEventState: () => ({ isFavorite: false, isSingle: false, isSeries: false }),
		addEventSingle: vi.fn(),
		addEventSeries: vi.fn(),
		removeEvent: vi.fn()
	}
}));

vi.mock('$lib/stores/events.svelte', () => ({
	eventStore: {
		refreshFilters: vi.fn()
	}
}));

function createEvent(overrides: Partial<TribeEvent> = {}): TribeEvent {
	return {
		id: 133680,
		title: 'Heidelberg Live Weekend',
		description: 'DJ Test',
		excerpt: 'Event excerpt',
		slug: 'heidelberg-live-weekend',
		url: 'https://www.rhein-neckar-tango.de/event/heidelberg-live-weekend',
		image: false,
		all_day: false,
		start_date: '2026-05-24 20:00:00',
		end_date: '2026-05-24 23:30:00',
		start_date_details: {
			year: '2026',
			month: '05',
			day: '24',
			hour: '20',
			minutes: '00',
			seconds: '00'
		},
		end_date_details: {
			year: '2026',
			month: '05',
			day: '24',
			hour: '23',
			minutes: '30',
			seconds: '00'
		},
		timezone: 'Europe/Berlin',
		timezone_abbr: 'CEST',
		cost: '18',
		cost_details: {
			currency_symbol: '€',
			currency_code: 'EUR',
			currency_position: 'prefix',
			values: ['18']
		},
		categories: [
			{ id: 1, name: 'Milonga', slug: 'typ_milonga', description: '', count: 1 },
			{ id: 2, name: 'Traditionell', slug: 'musik_traditionell', description: '', count: 1 }
		],
		venue: {
			id: 11,
			venue: 'Tangoloft',
			address: 'Teststrasse 1',
			city: 'Heidelberg',
			province: '',
			zip: '69115',
			country: 'DE',
			geo_lat: 49.4,
			geo_lng: 8.7,
			website: '',
			phone: ''
		},
		organizer: [
			{ id: 7, organizer: 'RNT', slug: 'rnt', url: '', website: '', email: '' }
		],
		featured: false,
		sticky: false,
		...overrides
	};
}

describe('EventCard', () => {
	it('renders recognized supplemental markers when matching categories are present', () => {
		renderComponent(EventCard, {
			event: createEvent({
				categories: [
					{ id: 1, name: 'Milonga', slug: 'typ_milonga', description: '', count: 1 },
					{ id: 2, name: 'Traditionell', slug: 'musik_traditionell', description: '', count: 1 },
					{ id: 3, name: 'Live Music', slug: 'livemusik', description: '', count: 1 },
					{ id: 4, name: 'Show', slug: 'feature_show', description: '', count: 1 }
				]
			})
		});

		expect(screen.getByText('Live-Musik')).toBeInTheDocument();
		expect(screen.getByText('Show')).toBeInTheDocument();
	});

	it('does not render a supplemental marker row for missing or unrecognized categories', () => {
		const { component } = renderComponent(EventCard, {
			event: createEvent({
				categories: [
					{ id: 1, name: 'Milonga', slug: 'typ_milonga', description: '', count: 1 },
					{ id: 2, name: 'Traditionell', slug: 'musik_traditionell', description: '', count: 1 },
					{ id: 5, name: 'Anmeldung eroefnet', slug: 'anmeldung_eroffnet', description: '', count: 1 }
				]
			})
		});

		expect(screen.queryByText('Live-Musik')).not.toBeInTheDocument();
		expect(screen.queryByText('Show')).not.toBeInTheDocument();
		expect(component.querySelector('[data-testid="event-card-highlights"]')).toBeNull();
	});
});