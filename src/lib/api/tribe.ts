import type { TribeEvent, EventsResponse, EventType, MusicType } from '$lib/types';

const BASE_URL = 'https://www.rhein-neckar-tango.de/wp-json/tribe/events/v1';

const TYPE_SLUGS: Record<EventType, string> = {
	milonga: 'typ_milonga',
	practica: 'typ_practica',
	workshop: 'typ_workshop',
	kurs: 'typ_kurs'
};

const MUSIC_SLUGS: Record<MusicType, string> = {
	traditional: 'musik_traditionell',
	mixed: 'musik_gemischt',
	neo: 'musik_neo-oder-non'
};

function formatDate(date: Date): string {
	return date.toISOString().split('T')[0];
}

function getDateRange(filter: string): { start: Date; end: Date } {
	const now = new Date();
	const start = new Date(now);
	start.setHours(0, 0, 0, 0);

	const end = new Date(now);
	end.setHours(23, 59, 59, 999);

	switch (filter) {
		case 'today':
			break;
		case 'week':
			end.setDate(end.getDate() + 7);
			break;
		case 'month':
			end.setMonth(end.getMonth() + 1);
			break;
		case 'all':
			end.setFullYear(end.getFullYear() + 2);
			break;
	}

	return { start, end };
}

export async function fetchEvents(
	types: EventType[] = [],
	music: MusicType | null = null,
	dateFilter: string = 'week',
	page: number = 1,
	perPage: number = 50
): Promise<EventsResponse> {
	const { start, end } = getDateRange(dateFilter);
	const params = new URLSearchParams({
		per_page: perPage.toString(),
		page: page.toString(),
		start_date: formatDate(start),
		end_date: formatDate(end),
		status: 'publish'
	});

	if (types.length > 0) {
		const typeTerms = types.map((t) => TYPE_SLUGS[t]).join(',');
		params.append('categories', typeTerms);
	}

	if (music) {
		params.append('categories', MUSIC_SLUGS[music]);
	}

	const url = `${BASE_URL}/events?${params.toString()}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to fetch events: ${response.status}`);
	}

	return response.json();
}

export async function fetchAllEvents(
	types: EventType[] = [],
	music: MusicType | null = null,
	dateFilter: string = 'all'
): Promise<TribeEvent[]> {
	const allEvents: TribeEvent[] = [];
	let page = 1;
	let hasMore = true;

	while (hasMore) {
		const data = await fetchEvents(types, music, dateFilter, page);
		allEvents.push(...data.events);
		hasMore = page < data.total_pages;
		page++;
	}

	return allEvents;
}

export function extractDjFromDescription(event: TribeEvent): string | null {
	const description = event.description || '';
	const djMatch = description.match(/DJ[:\s]+([^<,\n]+)/i);
	return djMatch ? djMatch[1].trim() : null;
}

export function extractWorkshopFromDescription(event: TribeEvent): string | null {
	const description = event.description || '';
	const workshopMatch = description.match(/Workshops?[:\s]+([^<,\n]+)/i);
	return workshopMatch ? workshopMatch[1].trim() : null;
}

export async function fetchEventById(id: number): Promise<TribeEvent> {
	const url = `${BASE_URL}/events/${id}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to fetch event: ${response.status}`);
	}

	return response.json();
}
