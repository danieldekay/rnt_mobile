import {
	EVENT_TYPE_SLUGS,
	MUSIC_SLUGS
} from '$lib/constants';
import type { TribeEvent, EventsResponse, EventType, MusicType, EventImage } from '$lib/types';

const BASE_URL = 'https://www.rhein-neckar-tango.de/wp-json/tribe/events/v1';

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

function normalizeEventImage(image: EventImage): string | false {
	if (!image) return false;
	if (typeof image === 'string') return normalizeText(image) || false;

	return (
		normalizeText(image.sizes?.medium_large?.url) ||
		normalizeText(image.sizes?.medium?.url) ||
		normalizeText(image.url) ||
		normalizeText(image.sizes?.thumbnail?.url) ||
		false
	);
}

function normalizeEuroAmount(value: string): string {
	if (/^\d+[.]\d{1,2}$/.test(value)) {
		return value.replace('.', ',');
	}

	return value;
}

function normalizeEvent(event: TribeEvent): TribeEvent {
	const normalizedDescription = normalizeHtml(event.description);
	const description = replaceObfuscatedEmailMarkup(normalizedDescription, event.url);

	return {
		...event,
		title: normalizeText(event.title),
		description,
		image: normalizeEventImage(event.image),
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

	const hasEuroMarker = /(?:€|\beur\b|\beuro\b)/i.test(normalizedCost);
	if (hasEuroMarker) {
		const strippedAmount = normalizedCost
			.replace(/(?:€|\beur\b|\beuro\b)/gi, ' ')
			.replace(/\s{2,}/g, ' ')
			.trim();

		if (strippedAmount) {
			return `${normalizeEuroAmount(strippedAmount)} €`;
		}
	}

	if (/^\d+(?:[.,]\d{1,2})?$/.test(normalizedCost)) {
		return `${normalizeEuroAmount(normalizedCost)} €`;
	}

	return normalizedCost;
}

function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
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
		case 'month': {
			const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
			end.setFullYear(lastDay.getFullYear());
			end.setMonth(lastDay.getMonth());
			end.setDate(lastDay.getDate());
			break;
		}
		case 'all':
			end.setFullYear(end.getFullYear() + 3);
			break;
	}

	return { start, end };
}

export async function fetchEvents(
	types: EventType[] = [],
	music: MusicType | null = null,
	dateFilter: string = 'week',
	page: number = 1,
	perPage: number = 50,
	signal?: AbortSignal
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
		const typeTerms = types.map((t) => EVENT_TYPE_SLUGS[t]).join(',');
		params.append('categories', typeTerms);
	}

	if (music) {
		params.append('categories', MUSIC_SLUGS[music]);
	}

	const url = `${BASE_URL}/events?${params.toString()}`;
	const response = await fetch(url, signal ? { signal } : undefined);

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
	const controller = new AbortController();
	const { signal } = controller;

	const MAX_PAGES = 60;
	const allEvents: TribeEvent[] = [];
	let page = 1;
	let hasMore = true;

	// Safety timeout: 2 minutes
	const timeout = setTimeout(() => controller.abort(), 2 * 60 * 1000);

	while (hasMore) {
		try {
			const data = await fetchEvents(types, music, dateFilter, page, 50, signal);
			allEvents.push(...data.events);
			hasMore = data.events.length > 0 && page < data.total_pages && page < MAX_PAGES;
			page++;
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') {
				console.warn('fetchAllEvents aborted after timeout or cancellation');
				break;
			}
			throw error;
		}
	}

	clearTimeout(timeout);
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

export class EventFetchError extends Error {
	constructor(public status: number, message: string) {
		super(message);
		this.name = 'EventFetchError';
	}
}

export async function fetchEventById(id: number): Promise<TribeEvent> {
	const url = `${BASE_URL}/events/${id}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new EventFetchError(response.status, `Failed to fetch event ${id}: ${response.status}`);
	}

	return normalizeEvent((await response.json()) as TribeEvent);
}
