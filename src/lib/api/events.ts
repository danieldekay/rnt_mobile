/**
 * Event fetching from Tribe Events API.
 * Includes pagination, date range calculation, and normalization.
 */

import { EVENT_TYPE_SLUGS, MUSIC_SLUGS } from "$lib/constants";
import type {
	TribeEvent,
	EventsResponse,
	EventType,
	MusicType,
} from "$lib/types";
import {
	normalizeEvent,
	normalizeText,
	normalizeEuroAmount,
} from "./normalizers";

const EVENTS_API_BASE = "/api/events";

// --- Cost formatting ---

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

// --- Date range helpers ---

export type EventDateRange = {
	start: Date;
	end: Date;
};

export function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

export function getDateRange(filter: string): EventDateRange {
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

// --- Single-page fetch ---

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

// --- Full pagination fetch ---

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

// --- Single event by ID ---

export async function fetchEventById(
	id: number,
	fetcher: typeof fetch = fetch,
	baseUrl: string = EVENTS_API_BASE,
): Promise<TribeEvent> {
	const url = `${baseUrl.replace(/\/$/, "")}/${id}`;
	const response = await fetcher(url);

	if (!response.ok) {
		throw new Error(`Failed to fetch event ${id}: ${response.status}`);
	}

	return normalizeEvent((await response.json()) as TribeEvent);
}

// --- Organizer's events ---

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
