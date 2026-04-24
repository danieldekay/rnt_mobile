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

const HTML_ENTITY_MAP: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
	ndash: '–',
	mdash: '—',
	hellip: '…',
	rsquo: '’',
	lsquo: '‘',
	rdquo: '”',
	ldquo: '“',
	laquo: '«',
	raquo: '»',
	deg: '°',
	euro: '€',
	copy: '©',
	reg: '®',
	trade: '™',
	uml: '¨',
	auml: 'ä',
	ouml: 'ö',
	uuml: 'ü',
	Auml: 'Ä',
	Ouml: 'Ö',
	Uuml: 'Ü',
	szlig: 'ß'
};

function decodeHtmlEntities(value: string): string {
	return value.replace(/&(#x?[\da-f]+|[a-z]+);/gi, (match, entity: string) => {
		if (entity.startsWith('#x') || entity.startsWith('#X')) {
			const codePoint = Number.parseInt(entity.slice(2), 16);
			return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
		}

		if (entity.startsWith('#')) {
			const codePoint = Number.parseInt(entity.slice(1), 10);
			return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
		}

		return HTML_ENTITY_MAP[entity] ?? match;
	});
}

function normalizeText(value: string | null | undefined): string {
	if (!value) return '';

	return decodeHtmlEntities(value)
		.replace(/\u00a0/g, ' ')
		.replace(/[ \t]{2,}/g, ' ')
		.trim();
}

function normalizeHtml(value: string | null | undefined): string {
	if (!value) return '';

	return decodeHtmlEntities(value).replace(/\u00a0/g, ' ');
}

function escapeHtmlAttribute(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;')
		.trim();
}

function replaceObfuscatedEmailMarkup(value: string, websiteUrl: string): string {
	const safeWebsiteUrl = escapeHtmlAttribute(websiteUrl);

	return value.replace(
		/<span\b[^>]*class=(['"])[^'"]*\bapbct-email-encoder\b[^'"]*\1[^>]*>(?:[\s\S]*?<span\b[^>]*class=(['"])[^'"]*\bapbct-blur\b[^'"]*\2[^>]*>[\s\S]*?<\/span>){1,4}[\s\S]*?<\/span>\s*\.?/gi,
		`(siehe <a href="${safeWebsiteUrl}" target="_blank" rel="noopener noreferrer">Website für Details</a>)`
	);
}

function normalizeEvent(event: TribeEvent): TribeEvent {
	const normalizedDescription = normalizeHtml(event.description);
	const description = replaceObfuscatedEmailMarkup(normalizedDescription, event.url);

	return {
		...event,
		title: normalizeText(event.title),
		description,
		cost: normalizeText(event.cost),
		venue: event.venue
			? {
				...event.venue,
				venue: normalizeText(event.venue.venue),
				address: normalizeText(event.venue.address),
				city: normalizeText(event.venue.city)
			}
			: event.venue,
		organizer: event.organizer?.map((organizer) => ({
			...organizer,
			organizer: normalizeText(organizer.organizer)
		})),
		categories: event.categories?.map((category) => ({
			...category,
			name: normalizeText(category.name)
		}))
	};
}

export function formatEventCost(cost: string | null | undefined): string {
	const normalizedCost = normalizeText(cost);
	if (!normalizedCost) return 'auf Anfrage';

	const lowerCost = normalizedCost.toLowerCase();
	if (normalizedCost === '0' || lowerCost.includes('frei') || lowerCost.includes('kostenlos') || lowerCost.includes('free')) {
		return 'Frei';
	}

	if (/^\d+(?:[.,]\d{1,2})?$/.test(normalizedCost)) {
		return `${normalizedCost}\u00a0€`;
	}

	return normalizedCost;
}

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

	const data = (await response.json()) as EventsResponse;
	return {
		...data,
		events: data.events.map(normalizeEvent)
	};
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
	return djMatch ? normalizeText(djMatch[1]) : null;
}

export function extractWorkshopFromDescription(event: TribeEvent): string | null {
	const description = event.description || '';
	const workshopMatch = description.match(/Workshops?[:\s]+([^<,\n]+)/i);
	return workshopMatch ? normalizeText(workshopMatch[1]) : null;
}

export async function fetchEventById(id: number): Promise<TribeEvent> {
	const url = `${BASE_URL}/events/${id}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to fetch event: ${response.status}`);
	}

	return normalizeEvent((await response.json()) as TribeEvent);
}
