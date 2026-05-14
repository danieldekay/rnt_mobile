import { EVENT_TYPE_SLUGS, MUSIC_SLUGS } from "$lib/constants";
import { fetchAllEvents, extractDjFromDescription } from "$lib/api/tribe";
import { trackFeatureEvent } from "$lib/matomo";
import { writable } from "svelte/store";
import type {
	TribeEvent,
	EventType,
	MusicType,
	DateFilter,
	Filters,
} from "$lib/types";

let activeRequestId = 0;

// ── Types ────────────────────────────────────────────────────────────────────

interface EventStoreData {
	events: TribeEvent[];
	allEvents: TribeEvent[];
	loading: boolean;
	error: string | null;
	searchQuery: string;
	filters: Filters;
}

// ── Store class ──────────────────────────────────────────────────────────────

class EventStore {
	// Internal reactive state
	events = $state.raw<TribeEvent[]>([]);
	allEvents = $state.raw<TribeEvent[]>([]);
	loading = $state.raw(false);
	error = $state.raw<string | null>(null);
	searchQuery = $state.raw("");
	filters = $state.raw({
		types: [] as EventType[],
		music: null as MusicType | null,
		date: "week" as DateFilter,
	});
	// Cache tracking (not reactive to consumers)
	lastFetchedDate: DateFilter | null = null;
	lastFetchedMonthKey: string | null = null;

	// Svelte store contract
	subscribe(run: (value: EventStoreData) => void) {
		return store.subscribe(run);
	}

	// ── Helpers ────────────────────────────────────────────────────────────

	private getMonthKey(date: Date): string {
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
	}

	private getMonthDateRange(date: Date): { start: Date; end: Date } {
		const start = new Date(date.getFullYear(), date.getMonth(), 1);
		start.setHours(0, 0, 0, 0);

		const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
		end.setHours(23, 59, 59, 999);

		return { start, end };
	}

	private eventMatchesTypes(event: TribeEvent, filters: Filters): boolean {
		if (filters.types.length === 0) return true;

		const categorySlugs =
			event.categories?.map((category) => category.slug) ?? [];
		return filters.types.some((type) =>
			categorySlugs.includes(EVENT_TYPE_SLUGS[type]),
		);
	}

	private eventMatchesMusic(event: TribeEvent, filters: Filters): boolean {
		if (!filters.music) return true;

		const categorySlugs =
			event.categories?.map((category) => category.slug) ?? [];
		return categorySlugs.includes(MUSIC_SLUGS[filters.music]);
	}

	private applyFilters(): TribeEvent[] {
		const query = this.searchQuery.toLowerCase();
		return this.allEvents.filter((event) => {
			if (
				!this.eventMatchesTypes(event, this.filters) ||
				!this.eventMatchesMusic(event, this.filters)
			) {
				return false;
			}

			if (!this.searchQuery.trim()) {
				return true;
			}

			const title = event.title?.toLowerCase() ?? "";
			const venue = event.venue?.venue?.toLowerCase() ?? "";
			const city = event.venue?.city?.toLowerCase() ?? "";
			const description = event.description?.toLowerCase() ?? "";
			const dj = extractDjFromDescription(event)?.toLowerCase() ?? "";
			const organizer = event.organizer?.[0]?.organizer?.toLowerCase() ?? "";
			return (
				title.includes(query) ||
				venue.includes(query) ||
				city.includes(query) ||
				description.includes(query) ||
				dj.includes(query) ||
				organizer.includes(query)
			);
		});
	}

	// ── Actions ────────────────────────────────────────────────────────────

	async loadEvents(forceRefresh = false) {
		if (
			!forceRefresh &&
			this.lastFetchedDate === this.filters.date &&
			this.allEvents.length > 0
		) {
			this.events = this.applyFilters();
			this.notify();
			return;
		}

		const requestId = ++activeRequestId;
		this.loading = true;
		this.error = null;
		this.notify();

		try {
			const fetchedEvents = await fetchAllEvents([], null, this.filters.date);

			if (requestId !== activeRequestId) return;

			this.lastFetchedDate = this.filters.date;
			this.lastFetchedMonthKey = null;
			this.allEvents = fetchedEvents;
			this.events = this.applyFilters();
			this.loading = false;
			this.notify();
		} catch (e) {
			if (requestId !== activeRequestId) return;

			this.loading = false;
			this.error = e instanceof Error ? e.message : "Failed to load events";
			trackFeatureEvent(
				"events",
				"api_error",
				e instanceof Error ? e.message : "fetch_error",
			);
			this.notify();
		}
	}

	async loadCalendarMonth(monthDate: Date, forceRefresh = false) {
		const monthKey = this.getMonthKey(monthDate);

		if (
			!forceRefresh &&
			this.lastFetchedMonthKey === monthKey &&
			this.allEvents.length > 0
		) {
			this.events = this.applyFilters();
			this.notify();
			return;
		}

		const requestId = ++activeRequestId;
		this.loading = true;
		this.error = null;
		this.notify();

		try {
			const fetchedEvents = await fetchAllEvents(
				[],
				null,
				"all",
				fetch,
				undefined,
				this.getMonthDateRange(monthDate),
			);

			if (requestId !== activeRequestId) return;

			this.lastFetchedMonthKey = monthKey;
			this.lastFetchedDate = null;
			this.allEvents = fetchedEvents;
			this.events = this.applyFilters();
			this.loading = false;
			this.notify();
		} catch (e) {
			if (requestId !== activeRequestId) return;

			this.loading = false;
			this.error =
				e instanceof Error ? e.message : "Failed to load calendar events";
			trackFeatureEvent(
				"calendar",
				"api_error",
				e instanceof Error ? e.message : "fetch_error",
			);
			this.notify();
		}
	}

	setFilters(newFilters: Partial<Filters>) {
		Object.assign(this.filters, newFilters);
		this.events = this.applyFilters();
		this.notify();
	}

	toggleType(type: EventType) {
		const includes = this.filters.types.includes(type);
		this.filters.types = includes
			? this.filters.types.filter((t) => t !== type)
			: [...this.filters.types, type];
		this.events = this.applyFilters();
		this.notify();
	}

	setMusic(music: MusicType | null) {
		this.filters.music = music;
		this.events = this.applyFilters();
		this.notify();
	}

	toggleMusic(music: MusicType) {
		this.setMusic(this.filters.music === music ? null : music);
	}

	setDateFilter(date: DateFilter) {
		if (this.filters.date === date) return;
		this.filters.date = date;
		void this.loadEvents();
	}

	setSearchQuery(query: string) {
		this.searchQuery = query;
		this.events = this.applyFilters();
		this.notify();
	}

	clearSearch() {
		this.searchQuery = "";
		this.events = this.applyFilters();
		this.notify();
	}

	// ── Notification ──────────────────────────────────────────────────────

	private notify() {
		store.set({
			events: this.events,
			allEvents: this.allEvents,
			loading: this.loading,
			error: this.error,
			searchQuery: this.searchQuery,
			filters: this.filters,
		});
	}
}

// ── Store instance + export ─────────────────────────────────────────────────

const store = writable<EventStoreData>({
	events: [],
	allEvents: [],
	loading: false,
	error: null,
	searchQuery: "",
	filters: { types: [], music: null, date: "week" },
});

export const eventStore = new EventStore();
