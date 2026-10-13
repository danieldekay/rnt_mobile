import { describe, expect, it } from 'vitest';
import { createEmptyFavorites } from '$lib/utils/favorites';
import { getFavoritePlanningEvents, getFavoritePlanningSections } from './planning';
import type { TribeEvent } from '$lib/types';

function event(id: number, startDate: string): TribeEvent {
	return {
		id,
		title: `Event ${id}`,
		slug: `event-${id}`,
		start_date: startDate,
		end_date: startDate,
		all_day: false,
		cost: '',
		categories: [],
		venue: undefined,
		organizer: [],
		description: '',
	} as unknown as TribeEvent;
}

describe('favorite planning helpers', () => {
	const now = new Date('2026-10-13T10:00:00.000Z');

	it('returns only future favorite events in chronological order', () => {
		const favorites = {
			...createEmptyFavorites(),
			eventIds: [3, 1, 2],
		};

		expect(
			getFavoritePlanningEvents(
				[
					event(1, '2026-10-13T09:00:00.000Z'),
					event(2, '2026-10-15T20:00:00.000Z'),
					event(3, '2026-10-13T19:00:00.000Z'),
					event(4, '2026-10-14T19:00:00.000Z'),
				],
				favorites,
				now,
			).map((item) => item.id),
		).toEqual([3, 2]);
	});

	it('groups favorites into today, next seven days, and later planning sections', () => {
		const favorites = {
			...createEmptyFavorites(),
			eventIds: [1, 2, 3],
		};

		const sections = getFavoritePlanningSections(
			[
				event(1, '2026-10-13T18:00:00.000Z'),
				event(2, '2026-10-17T18:00:00.000Z'),
				event(3, '2026-10-25T18:00:00.000Z'),
			],
			favorites,
			now,
		);

		expect(sections).toHaveLength(3);
		expect(sections[0]).toMatchObject({ id: 'today', label: 'Heute' });
		expect(sections[0].events.map((item) => item.id)).toEqual([1]);
		expect(sections[1]).toMatchObject({ id: 'next-7-days', label: 'Nächste 7 Tage' });
		expect(sections[1].events.map((item) => item.id)).toEqual([2]);
		expect(sections[2]).toMatchObject({ id: 'later', label: 'Später' });
		expect(sections[2].events.map((item) => item.id)).toEqual([3]);
	});
});
