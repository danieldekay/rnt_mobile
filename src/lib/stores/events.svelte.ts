
import {
    fetchAllEvents,
    getContinuationDateRange,
    fetchNextEventsRange,
    getDateRange,
    type EventDateRange,
    extractDjFromDescription,
} from "$lib/api/tribe";
import { trackFeatureEvent } from "$lib/matomo";
import { writable } from "svelte/store";
import { getEventType, getMusicType } from "$lib/utils/event-presentation";
import { favoritesStore } from "$lib/stores/favorites.svelte";
import { matchesFavoriteEvent } from "$lib/utils/favorites";
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
    appendLoading: boolean;
    appendError: string | null;
    canLoadMore: boolean;
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
    appendLoading = $state.raw(false);
    appendError = $state.raw<string | null>(null);
    canLoadMore = $state.raw(false);
    searchQuery = $state.raw("");
    filters = $state.raw({
        types: [] as EventType[],
        music: null as MusicType | null,
        date: "week" as DateFilter,
        favoritesOnly: false,
    });
    // Cache tracking (not reactive to consumers)
    lastFetchedDate: DateFilter | null = null;
    lastFetchedMonthKey: string | null = null;
    currentRange: EventDateRange | null = null;
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

    private sortEvents(events: TribeEvent[]): TribeEvent[] {
        return [...events].sort((left, right) => {
            const dateCompare = left.start_date.localeCompare(right.start_date);
            if (dateCompare !== 0) return dateCompare;
            return left.id - right.id;
        });
    }

    private mergeEvents(existing: TribeEvent[], incoming: TribeEvent[]): TribeEvent[] {
        const eventsById = new Map<number, TribeEvent>();

        for (const event of existing) {
            eventsById.set(event.id, event);
        }

        for (const event of incoming) {
            eventsById.set(event.id, event);
        }

        return this.sortEvents(Array.from(eventsById.values()));
    }

    private resetProgressiveState(dateFilter: DateFilter = this.filters.date) {
        this.appendLoading = false;
        this.appendError = null;
        this.canLoadMore = dateFilter === "week";
        this.currentRange = this.canLoadMore ? getDateRange(dateFilter) : null;
    }

    private matchesCategoryFilters(event: TribeEvent): boolean {
        const eventType = getEventType(event);
        const musicType = getMusicType(event);

        const matchesType =
            this.filters.types.length === 0 ||
            (eventType !== null && this.filters.types.includes(eventType));

        const matchesMusic =
            this.filters.music === null ||
            musicType === this.filters.music;

        return matchesType && matchesMusic;
    }

    private applyFilters(): TribeEvent[] {
        const query = this.searchQuery.toLowerCase();
        return this.allEvents.filter((event) => {
            if (!this.matchesCategoryFilters(event)) {
                return false;
            }

            if (
                this.filters.favoritesOnly &&
                !matchesFavoriteEvent(event, favoritesStore.snapshot)
            ) {
                return false;
            }

            if (!query.trim()) {
                return true;
            }

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
        this.resetProgressiveState(this.filters.date);
        this.notify();

        try {
            const fetchedEvents = await fetchAllEvents([], null, this.filters.date);

            if (requestId !== activeRequestId) return;

            this.lastFetchedDate = this.filters.date;
            this.lastFetchedMonthKey = null;
            this.allEvents = this.sortEvents(fetchedEvents);
            this.buildSearchIndex(this.allEvents);
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
        this.resetProgressiveState("all");
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
            this.allEvents = this.sortEvents(fetchedEvents);
            this.buildSearchIndex(this.allEvents);
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

    toggleFavoritesOnly() {
        this.filters.favoritesOnly = !this.filters.favoritesOnly;
        this.events = this.applyFilters();
        this.notify();
    }

    refreshFilters() {
        this.events = this.applyFilters();
        this.notify();
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

    async loadNextRange() {
        if (!this.currentRange || !this.canLoadMore || this.loading || this.appendLoading) {
            return [] as TribeEvent[];
        }

        const requestId = ++activeRequestId;
        this.appendLoading = true;
        this.appendError = null;
        this.notify();

        try {
            const fetchedEvents = await fetchNextEventsRange(this.currentRange);

            if (requestId !== activeRequestId) return [] as TribeEvent[];

            this.currentRange = getContinuationDateRange(this.currentRange);
            const mergedEvents = this.mergeEvents(this.allEvents, fetchedEvents);
            this.allEvents = mergedEvents;
            this.buildSearchIndex(mergedEvents);
            this.events = this.applyFilters();
            this.appendLoading = false;
            this.notify();

            return fetchedEvents;
        } catch (e) {
            if (requestId !== activeRequestId) return [] as TribeEvent[];

            this.appendLoading = false;
            this.appendError = e instanceof Error ? e.message : "Failed to load more events";
            this.notify();

            return [] as TribeEvent[];
        }
    }

    setDateFilter(date: DateFilter) {
        if (this.filters.date === date) return;
        this.filters.date = date;
        this.resetProgressiveState(date);
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
            appendLoading: this.appendLoading,
            appendError: this.appendError,
            canLoadMore: this.canLoadMore,
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
    appendLoading: false,
    appendError: null,
    canLoadMore: false,
    searchQuery: "",
    filters: { types: [], music: null, date: "week", favoritesOnly: false },
});

export const eventStore = new EventStore();
