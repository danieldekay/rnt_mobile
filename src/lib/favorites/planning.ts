import type { TribeEvent } from '$lib/types';
import { matchesFavoriteEvent, type FavoritesSnapshot } from '$lib/utils/favorites';

export type FavoritePlanningSectionId = 'today' | 'next-7-days' | 'later';

export interface FavoritePlanningSection {
	id: FavoritePlanningSectionId;
	label: string;
	description: string;
	events: TribeEvent[];
}

function startOfDay(date: Date): Date {
	const copy = new Date(date);
	copy.setHours(0, 0, 0, 0);
	return copy;
}

function endOfDay(date: Date): Date {
	const copy = new Date(date);
	copy.setHours(23, 59, 59, 999);
	return copy;
}

function addDays(date: Date, days: number): Date {
	const copy = new Date(date);
	copy.setDate(copy.getDate() + days);
	return copy;
}

export function getFavoritePlanningEvents(
	events: TribeEvent[],
	favorites: FavoritesSnapshot,
	now = new Date(),
): TribeEvent[] {
	return events
		.filter((event) => {
			const start = new Date(event.start_date);
			return start >= now && matchesFavoriteEvent(event, favorites);
		})
		.sort((left, right) => left.start_date.localeCompare(right.start_date));
}

export function getFavoritePlanningSections(
	events: TribeEvent[],
	favorites: FavoritesSnapshot,
	now = new Date(),
): FavoritePlanningSection[] {
	const todayEnd = endOfDay(now);
	const nextSevenDaysEnd = endOfDay(addDays(startOfDay(now), 7));
	const planningEvents = getFavoritePlanningEvents(events, favorites, now);

	const sections: FavoritePlanningSection[] = [
		{
			id: 'today',
			label: 'Heute',
			description: 'Direkt relevant für die nächste Entscheidung.',
			events: [],
		},
		{
			id: 'next-7-days',
			label: 'Nächste 7 Tage',
			description: 'Kurzfristige Planung für diese Woche.',
			events: [],
		},
		{
			id: 'later',
			label: 'Später',
			description: 'Gespeicherte Termine im weiteren 90-Tage-Fenster.',
			events: [],
		},
	];

	for (const event of planningEvents) {
		const start = new Date(event.start_date);
		if (start <= todayEnd) {
			sections[0].events.push(event);
		} else if (start <= nextSevenDaysEnd) {
			sections[1].events.push(event);
		} else {
			sections[2].events.push(event);
		}
	}

	return sections;
}
