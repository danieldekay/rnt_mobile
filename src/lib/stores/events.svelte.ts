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
const SEARCH_DEBOUNCE_MS = 250;
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

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
	// Precomputed search index (event -> searchable text) for fast filtering
	private searchIndex: Map<number, string> = new Map();

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

	private applyFilters(): TribeEvent[] {
		const query = this.searchQuery.toLowerCase();
		if (!query.trim()) {
			return this.allEvents;
		}

		return this.allEvents.filter((event) => {
			// Use precomputed index when available, fall back to runtime computation
			const indexedText = this.searchIndex.get(event.id);
			if (indexedText) return indexedText.includes(query);

			// Fallback: compute searchable text at runtime (first search after load)
			const searchable = [
				event.title,
				event.venue?.venue,
				event.venue?.city,
				event.description,
				extractDjFromDescription(event),
				event.organizer?.[0]?.organizer,
			].filter(Boolean).join(" ").toLowerCase();

			// Cache for future searches
			this.searchIndex.set(event.id, searchable);
			return searchable.includes(query);
		});
	}

	private buildSearchIndex(events: TribeEvent[]): void {
		this.searchIndex.clear();
		for (const event of events) {
			const searchable = [
				event.title,
				event.venue?.venue,
				event.venue?.city,
				event.description,
				extractDjFromDescription(event),
				event.organizer?.[0]?.organizer,
			].filter(Boolean).join(" ").toLowerCase();
			this.searchIndex.set(event.id, searchable);
		}
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
			this.buildSearchIndex(fetchedEvents);
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
			this.buildSearchIndex(fetchedEvents);
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
		if (searchDebounceTimer) {
			clearTimeout(searchDebounceTimer);
		}
		searchDebounceTimer = setTimeout(() => {
			this.searchQuery = query;
			this.events = this.applyFilters();
			this.notify();
			searchDebounceTimer = null;
		}, SEARCH_DEBOUNCE_MS);
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
