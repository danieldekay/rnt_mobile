import { EVENT_TYPE_SLUGS, MUSIC_SLUGS } from "$lib/constants";
import he from "he";
import type {
	TribeEvent,
	EventsResponse,
	EventType,
	MusicType,
	EventImage,
	TribeVenue,
	TribeOrganizer,
	DjCptEntry,
	EnhancedOrganizer,
	EnhancedVenue,
} from "$lib/types";
import {
	fetchEnhancedOrganizersWithErrorHandling,
	fetchEnhancedVenuesWithErrorHandling,
} from "$lib/utils/error-handling";

const EVENTS_API_BASE = "/api/events";
const VENUES_API_BASE = "/api/venues";
const ORGANIZERS_API_BASE = "/api/organizers";
const DJ_API_BASE = "https://www.rhein-neckar-tango.de/wp-json/wp/v2/dj";

function decodeHtmlEntities(value: string): string {
	return he.decode(value);
}

function normalizeText(value: string | null | undefined): string {
	if (!value) return "";

	return decodeHtmlEntities(value)
		.replace(/\u00a0/g, " ")
		.replace(/[ \t]{2,}/g, " ")
		.trim();
}

function normalizeHtml(value: string | null | undefined): string {
	if (!value) return "";

	return decodeHtmlEntities(value).replace(/\u00a0/g, " ");
}

function stripHtmlToPlainText(value: string | null | undefined): string {
	if (!value) return "";

	return normalizeHtml(value)
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/(p|div|li|h[1-6]|section|article)>/gi, "\n")
		.replace(/<[^>]+>/g, " ")
		.replace(/[ \t]+\n/g, "\n")
		.replace(/\n{2,}/g, "\n")
		.replace(/[ \t]{2,}/g, " ")
		.trim();
}

function escapeHtmlAttribute(value: string): string {
	return he.escape(value).trim();
}

function replaceObfuscatedEmailMarkup(
	value: string,
	websiteUrl: string,
): string {
	const safeWebsiteUrl = escapeHtmlAttribute(websiteUrl);

	return value.replace(
		/<span\b[^>]*class=(['"])[^'"]*\bapbct-email-encoder\b[^'"]*\1[^>]*>(?:[\s\S]*?<span\b[^>]*class=(['"])[^'"]*\bapbct-blur\b[^'"]*\2[^>]*>[\s\S]*?<\/span>){1,4}[\s\S]*?<\/span>\s*\.?/gi,
		`(siehe <a href="${safeWebsiteUrl}" target="_blank" rel="noopener noreferrer">Website für Details</a>)`,
	);
}

function normalizeEventImage(image: EventImage): string | false {
	if (!image) return false;
	if (typeof image === "string") return normalizeText(image) || false;

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
		return value.replace(".", ",");
	}

	return value;
}

type RawTribeVenue = {
	id?: number | string;
	venue?: string | null;
	address?: string | null;
	city?: string | null;
	geo_lat?: number | string | null;
	geo_lng?: number | string | null;
	website?: string | null;
};

type VenuesResponse = {
	venues?: RawTribeVenue[];
	total_pages?: number | string;
};

type RawTribeOrganizer = {
	id?: number | string;
	organizer?: string | null;
	slug?: string | null;
	url?: string | null;
	website?: string | null;
	email?: string | null;
	phone?: string | null;
	description?: string | null;
	image?: EventImage;
};

type OrganizersResponse = {
	organizers?: RawTribeOrganizer[];
	total_pages?: number | string;
};

function normalizeCoordinate(
	value: number | string | null | undefined,
): number | null {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === "string") {
		const parsed = Number.parseFloat(value.replace(",", "."));
		return Number.isFinite(parsed) ? parsed : null;
	}

	return null;
}

function normalizeVenue(venue: RawTribeVenue): TribeVenue {
	const parsedId =
		typeof venue.id === "string" ? Number.parseInt(venue.id, 10) : venue.id;

	return {
		id: Number.isFinite(parsedId) ? Number(parsedId) : 0,
		venue: normalizeText(venue.venue),
		address: normalizeText(venue.address),
		city: normalizeText(venue.city),
		geo_lat: normalizeCoordinate(venue.geo_lat),
		geo_lng: normalizeCoordinate(venue.geo_lng),
		website: normalizeText(venue.website),
	};
}

function normalizeWebsiteUrl(value: string | null | undefined): string {
	const normalized = normalizeText(value);
	if (!normalized) return "";

	if (/^https?:\/\//i.test(normalized)) {
		return normalized;
	}

	if (normalized.startsWith("//")) {
		return `https:${normalized}`;
	}

	return `https://${normalized}`;
}

function normalizeOrganizer(organizer: RawTribeOrganizer): TribeOrganizer {
	const parsedId =
		typeof organizer.id === "string"
			? Number.parseInt(organizer.id, 10)
			: organizer.id;

	return {
		id: Number.isFinite(parsedId) ? Number(parsedId) : 0,
		organizer: normalizeText(organizer.organizer),
		slug: normalizeText(organizer.slug),
		url: normalizeText(organizer.url),
		website: normalizeWebsiteUrl(organizer.website),
		email: normalizeText(organizer.email),
		phone: normalizeText(organizer.phone),
		description: normalizeHtml(organizer.description),
		image: normalizeEventImage(organizer.image ?? false),
	};
}

function normalizeEvent(event: TribeEvent): TribeEvent {
	const normalizedDescription = normalizeHtml(event.description);
	const description = replaceObfuscatedEmailMarkup(
		normalizedDescription,
		event.url,
	);

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
					city: normalizeText(event.venue.city),
				}
			: event.venue,
		organizer: event.organizer?.map((organizer) => ({
			...organizer,
			organizer: normalizeText(organizer.organizer),
		})),
		categories: event.categories?.map((category) => ({
			...category,
			name: normalizeText(category.name),
		})),
	};
}

export function formatEventCost(cost: string | null | undefined): string {
	const normalizedCost = normalizeText(cost);
	if (!normalizedCost) return "auf Anfrage";

	const lowerCost = normalizedCost.toLowerCase();
	if (
		normalizedCost === "0" ||
		lowerCost.includes("frei") ||
		lowerCost.includes("kostenlos") ||
		lowerCost.includes("free")
	) {
		return "Frei";
	}

	const hasEuroMarker = /(?:€|\beur\b|\beuro\b)/i.test(normalizedCost);
	if (hasEuroMarker) {
		const strippedAmount = normalizedCost
			.replace(/(?:€|\beur\b|\beuro\b)/gi, " ")
			.replace(/\s{2,}/g, " ")
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
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

type EventDateRange = {
	start: Date;
	end: Date;
};

function getDateRange(filter: string): { start: Date; end: Date } {
	const now = new Date();
	const start = new Date(now);
	start.setHours(0, 0, 0, 0);

	const end = new Date(now);
	end.setHours(23, 59, 59, 999);

	switch (filter) {
		case "today":
			break;
		case "week":
			end.setDate(end.getDate() + 7);
			break;
		case "month": {
			const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
			end.setFullYear(lastDay.getFullYear());
			end.setMonth(lastDay.getMonth());
			end.setDate(lastDay.getDate());
			break;
		}
		case "all":
			end.setFullYear(end.getFullYear() + 3);
			break;
	}

	return { start, end };
}

export async function fetchEvents(
	types: EventType[] = [],
	music: MusicType | null = null,
	dateFilter: string = "week",
	page: number = 1,
	perPage: number = 50,
	signal?: AbortSignal,
	fetcher: typeof fetch = fetch,
	baseUrl: string = EVENTS_API_BASE,
	dateRange?: EventDateRange,
): Promise<EventsResponse> {
	const { start, end } = dateRange ?? getDateRange(dateFilter);
	const params = new URLSearchParams({
		per_page: perPage.toString(),
		page: page.toString(),
		start_date: formatDate(start),
		end_date: formatDate(end),
		status: "publish",
	});

	if (types.length > 0) {
		const typeTerms = types.map((t) => EVENT_TYPE_SLUGS[t]).join(",");
		params.append("categories", typeTerms);
	}

	if (music) {
		params.append("categories", MUSIC_SLUGS[music]);
	}

	const url = `${baseUrl.replace(/\/$/, "")}?${params.toString()}`;
	const response = await fetcher(url, signal ? { signal } : undefined);

	if (!response.ok) {
		throw new Error(`Failed to fetch events: ${response.status}`);
	}

	const data = (await response.json()) as EventsResponse;
	return {
		...data,
		events: data.events.map(normalizeEvent),
	};
}

export async function fetchAllEvents(
	types: EventType[] = [],
	music: MusicType | null = null,
	dateFilter: string = "all",
	fetcher: typeof fetch = fetch,
	baseUrl: string = EVENTS_API_BASE,
	dateRange?: EventDateRange,
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
			const data = await fetchEvents(
				types,
				music,
				dateFilter,
				page,
				50,
				signal,
				fetcher,
				baseUrl,
				dateRange,
			);
			allEvents.push(...data.events);
			hasMore =
				data.events.length > 0 && page < data.total_pages && page < MAX_PAGES;
			page++;
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") {
				console.warn("fetchAllEvents aborted after timeout or cancellation");
				break;
			}
			throw error;
		}
	}

	clearTimeout(timeout);
	return allEvents;
}

export async function fetchVenues(
	fetcher: typeof fetch = fetch,
): Promise<TribeVenue[]> {
	const response = await fetcher(`${VENUES_API_BASE}?per_page=100`);

	if (!response.ok) {
		return [];
	}

	const data = (await response.json()) as VenuesResponse;
	return (data.venues ?? [])
		.map(normalizeVenue)
		.filter((venue) => venue.id > 0 && venue.venue.length > 0);
}

export async function fetchOrganizers(
	fetcher: typeof fetch = fetch,
): Promise<TribeOrganizer[]> {
	const organizers: TribeOrganizer[] = [];
	const seenIds = new Set<number>();
	const perPage = 100;
	const maxPages = 30;

	for (let page = 1; page <= maxPages; page++) {
		const response = await fetcher(
			`${ORGANIZERS_API_BASE}?per_page=${perPage}&page=${page}`,
		);

		if (!response.ok) {
			if (page === 1) {
				return [];
			}

			break;
		}

		const data = (await response.json()) as OrganizersResponse;
		const pageOrganizers = (data.organizers ?? [])
			.map(normalizeOrganizer)
			.filter(
				(organizer) => organizer.id > 0 && organizer.organizer.length > 0,
			);

		for (const organizer of pageOrganizers) {
			if (seenIds.has(organizer.id)) continue;
			seenIds.add(organizer.id);
			organizers.push(organizer);
		}

		const totalPagesRaw =
			typeof data.total_pages === "string"
				? Number.parseInt(data.total_pages, 10)
				: data.total_pages;
		const totalPages = Number.isFinite(totalPagesRaw)
			? Number(totalPagesRaw)
			: null;

		if (
			pageOrganizers.length === 0 ||
			(totalPages !== null && page >= totalPages)
		) {
			break;
		}
	}

	return organizers;
}

function cleanDjCandidate(candidate: string): string {
	return normalizeText(candidate)
		.replace(/^[-–—:|/]+/, "")
		.replace(/^["'„“‚‘]+|["'„“‚‘]+$/g, "")
		.replace(/[|•].*$/, "")
		.replace(/[.?!]+$/g, "")
		.replace(/\s+(?:aus|von)\s+[A-ZÄÖÜ][^,.;?]*$/u, "")
		.replace(
			/\s+(?:für|für|spielt|legt|sorgt|an\s+den\s+(?:decks|turntables)|heute|heut[e]?|live)\b.*$/i,
			"",
		)
		.replace(
			/[.!?]\s+(?:wir|tanzen|im|in|am|mit|beginn|eintritt|details?)\b.*$/i,
			"",
		)
		.replace(/\s{2,}/g, " ")
		.trim();
}

function isPlausibleDjName(value: string): boolean {
	if (!value) return false;
	if (value.length > 48) return false;
	if (/\d/.test(value)) return false;
	if (!/[A-Za-zÄÖÜäöüß]/.test(value)) return false;
	if (/[,:;]/.test(value)) return false;
	if (
		/\b(wir|tanzen|saal|uhr|beginn|eintritt|workshop|milonga|practica|kurs|anmeldung|details?|tickets?|homepage|website|webseite|siehe|klassisch|tandas?|cortinas?|ueberwiegend|überwiegend|sorgen?)\b/i.test(
			value,
		)
	) {
		return false;
	}

	const wordCount = value
		.split(/\s+/)
		.map((part) => part.trim())
		.filter(Boolean).length;

	if (wordCount === 1 && value === value.toLocaleLowerCase("de")) {
		return false;
	}

	return wordCount > 0 && wordCount <= 6;
}

export function extractDjFromDescription(event: TribeEvent): string | null {
	const description = stripHtmlToPlainText(event.description);
	const djPatterns = [/\bdj(?:s)?\b\s*[:-]?\s*([^\n]+)/gi];

	for (const pattern of djPatterns) {
		for (const djMatch of description.matchAll(pattern)) {
			const candidate = cleanDjCandidate(djMatch[1] ?? "");
			if (isPlausibleDjName(candidate)) {
				return candidate;
			}
		}
	}

	return null;
}

export function extractWorkshopFromDescription(
	event: TribeEvent,
): string | null {
	const description = event.description || "";
	const workshopMatch = description.match(/Workshops?[:\s]+([^<,\n]+)/i);
	return workshopMatch ? normalizeText(workshopMatch[1]) : null;
}

export class EventFetchError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(message);
		this.name = "EventFetchError";
	}
}

export async function fetchEventById(
	id: number,
	fetcher: typeof fetch = fetch,
	baseUrl: string = EVENTS_API_BASE,
): Promise<TribeEvent> {
	const url = `${baseUrl.replace(/\/$/, "")}/${id}`;
	const response = await fetcher(url);

	if (!response.ok) {
		throw new EventFetchError(
			response.status,
			`Failed to fetch event ${id}: ${response.status}`,
		);
	}

	return normalizeEvent((await response.json()) as TribeEvent);
}

export async function fetchDjCptList(
	fetcher: typeof fetch = fetch,
): Promise<DjCptEntry[]> {
	const url = `${DJ_API_BASE}?per_page=100&_fields=id,slug,title,meta_box&orderby=title&order=asc`;
	const response = await fetcher(url);
	if (!response.ok) return [];
	const raw = (await response.json()) as Array<{
		id?: number;
		slug?: string;
		title?: { rendered?: string };
		meta_box?: Record<string, unknown>;
	}>;
	if (!Array.isArray(raw)) return [];
	return raw
		.map((entry) => ({
			id: typeof entry.id === "number" ? entry.id : 0,
			slug: typeof entry.slug === "string" ? entry.slug.trim() : "",
			name:
				typeof entry.title?.rendered === "string"
					? entry.title.rendered.trim()
					: "",
			meta_box: entry.meta_box as DjCptEntry["meta_box"],
		}))
		.filter(
			(entry) => entry.id > 0 && entry.slug.length > 0 && entry.name.length > 0,
		);
}

export async function fetchDjCptBySlug(
	slug: string,
	fetcher: typeof fetch = fetch,
): Promise<DjCptEntry | null> {
	const url = `${DJ_API_BASE}?slug=${encodeURIComponent(slug)}&_fields=id,slug,title,meta_box`;
	const response = await fetcher(url);
	if (!response.ok) return null;
	const raw = (await response.json()) as Array<{
		id?: number;
		slug?: string;
		title?: { rendered?: string };
		meta_box?: Record<string, unknown>;
	}>;
	if (!Array.isArray(raw) || raw.length === 0) return null;
	const entry = raw[0];
	return {
		id: typeof entry.id === "number" ? entry.id : 0,
		slug: typeof entry.slug === "string" ? entry.slug.trim() : "",
		name:
			typeof entry.title?.rendered === "string"
				? entry.title.rendered.trim()
				: "",
		meta_box: entry.meta_box as DjCptEntry["meta_box"],
	};
}

export async function fetchOrganizerEvents(
	organizerId: number,
	fetcher: typeof fetch = fetch,
): Promise<TribeEvent[]> {
	const url = `${EVENTS_API_BASE}?organizer=${organizerId}`;
	const response = await fetcher(url);
	if (!response.ok) return [];
	const data = (await response.json()) as EventsResponse;
	return (data.events ?? [])
		.map(normalizeEvent)
		.filter((event) => event.start_date.length > 0)
		.sort((a, b) => a.start_date.localeCompare(b.start_date));
}

// Enhanced organizer functions
export async function fetchEnhancedOrganizers(
	fetcher: typeof fetch = fetch,
): Promise<EnhancedOrganizer[]> {
	const basicOrganizers = await fetchOrganizers(fetcher);

	// For each organizer, fetch additional metadata
	const enhancedOrganizers: EnhancedOrganizer[] = [];

	for (const organizer of basicOrganizers) {
		try {
			// Fetch additional organizer data from WordPress API
			const response = await fetcher(
				`${ORGANIZERS_API_BASE}/${organizer.id}?_embed=wp:featuredmedia`,
			);
			if (!response.ok) continue;

			const rawData = await response.json();
			const enhanced: EnhancedOrganizer = {
				...organizer,
				socialMedia: {
					website: organizer.website,
					// Additional social media fields can be extracted from custom fields
				},
				contact: {
					phone: organizer.phone,
					email: organizer.email,
				},
				details: {
					description: organizer.description,
					tags: extractTagsFromRawData(rawData),
				},
				media: {
					logo: extractFeaturedImage(rawData),
				},
				timestamps: {
					createdAt: rawData.date,
					updatedAt: rawData.modified,
				},
				verification: {
					isVerified: checkVerificationStatus(rawData),
				},
			};

			enhancedOrganizers.push(enhanced);
		} catch (error) {
			// If fetching additional data fails, fall back to basic organizer data
			enhancedOrganizers.push({
				...organizer,
				contact: {
					phone: organizer.phone,
					email: organizer.email,
				},
			});
		}
	}

	return enhancedOrganizers;
}

// Enhanced venue functions
export async function fetchEnhancedVenues(
	fetcher: typeof fetch = fetch,
): Promise<EnhancedVenue[]> {
	const basicVenues = await fetchVenues(fetcher);

	// For each venue, fetch additional metadata
	const enhancedVenues: EnhancedVenue[] = [];

	for (const venue of basicVenues) {
		try {
			// Fetch additional venue data from WordPress API
			const response = await fetcher(
				`${VENUES_API_BASE}/${venue.id}?_embed=wp:featuredmedia`,
			);
			if (!response.ok) continue;

			const rawData = await response.json();
			const enhanced: EnhancedVenue = {
				...venue,
				location: {
					address: venue.address,
					city: venue.city,
					coordinates:
						venue.geo_lat && venue.geo_lng
							? {
									latitude: venue.geo_lat,
									longitude: venue.geo_lng,
								}
							: undefined,
				},
				contact: {
					phone: extractContactInfo(rawData, "phone"),
					email: extractContactInfo(rawData, "email"),
					website: venue.website,
				},
				socialMedia: {
					website: venue.website,
					// Additional social media fields can be extracted from custom fields
				},
				media: {
					logo: extractFeaturedImage(rawData),
				},
				hours: extractOperatingHours(rawData),
				details: {
					description: extractDescription(rawData),
					tags: extractTagsFromRawData(rawData),
				},
				timestamps: {
					createdAt: rawData.date,
					updatedAt: rawData.modified,
				},
				verification: {
					isVerified: checkVerificationStatus(rawData),
				},
			};

			enhancedVenues.push(enhanced);
		} catch (error) {
			// If fetching additional data fails, fall back to basic venue data
			enhancedVenues.push({
				...venue,
				location: {
					address: venue.address,
					city: venue.city,
					coordinates:
						venue.geo_lat && venue.geo_lng
							? {
									latitude: venue.geo_lat,
									longitude: venue.geo_lng,
								}
							: undefined,
				},
			});
		}
	}

	return enhancedVenues;
}

// Helper functions
function extractTagsFromRawData(rawData: any): string[] {
	if (!rawData._embedded?.["wp:term"]) return [];

	return rawData._embedded["wp:term"]
		.flat()
		.filter((term: any) => term.taxonomy === "post_tag")
		.map((term: any) => term.name);
}

function extractFeaturedImage(rawData: any): string | undefined {
	if (!rawData._embedded?.["wp:featuredmedia"]?.[0]?.source_url) {
		return undefined;
	}

	return rawData._embedded["wp:featuredmedia"][0].source_url;
}

function extractContactInfo(
	rawData: any,
	type: "phone" | "email",
): string | undefined {
	// Extract from custom fields or ACF
	if (rawData.acf?.[`rnt_${type}`]) {
		return rawData.acf[`rnt_${type}`];
	}

	return undefined;
}

function extractDescription(rawData: any): string | undefined {
	return rawData.content?.rendered || rawData.excerpt?.rendered;
}

function extractOperatingHours(rawData: any): any {
	// Extract operating hours from custom fields
	return (
		rawData.acf?.rnt_oeffnungszeiten || {
			monday: "Geschlossen",
			tuesday: "Geschlossen",
			wednesday: "Geschlossen",
			thursday: "Geschlossen",
			friday: "Geschlossen",
			saturday: "Geschlossen",
			sunday: "Geschlossen",
		}
	);
}

function checkVerificationStatus(rawData: any): boolean {
	return rawData.acf?.rnt_verified === "yes" || false;
}

// Export error handling functions for testing
export {
	fetchEnhancedOrganizersWithErrorHandling,
	fetchEnhancedVenuesWithErrorHandling,
};
