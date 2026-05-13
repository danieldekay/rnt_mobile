import { EVENT_TYPE_SLUGS, MUSIC_SLUGS } from "$lib/constants";
import { fetchAllEvents, extractDjFromDescription } from "$lib/api/tribe";
import { trackFeatureEvent } from "$lib/matomo";
import type {
	TribeEvent,
	EventType,
	MusicType,
	DateFilter,
	Filters,
} from "$lib/types";
import { get, writable } from "svelte/store";

interface EventStoreState {
	events: TribeEvent[];
	allEvents: TribeEvent[];
	loading: boolean;
	error: string | null;
	searchQuery: string;
	filters: Filters;
}

const INITIAL_STATE: EventStoreState = {
	events: [],
	allEvents: [],
	loading: false,
	error: null,
	searchQuery: "",
	filters: {
		types: [],
		music: null,
		date: "week",
	},
};

function createEventStore() {
	const store = writable<EventStoreState>(INITIAL_STATE);
	const { subscribe, update } = store;

	let lastFetchedDate: DateFilter | null = null;
	let lastFetchedMonthKey: string | null = null;
	let activeRequestId = 0;

	function getMonthKey(date: Date): string {
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
	}

	function getMonthDateRange(date: Date): { start: Date; end: Date } {
		const start = new Date(date.getFullYear(), date.getMonth(), 1);
		start.setHours(0, 0, 0, 0);

		const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
		end.setHours(23, 59, 59, 999);

		return { start, end };
	}

	function eventMatchesTypes(event: TribeEvent, filters: Filters): boolean {
		if (filters.types.length === 0) return true;

		const categorySlugs =
			event.categories?.map((category) => category.slug) ?? [];
		return filters.types.some((type) =>
			categorySlugs.includes(EVENT_TYPE_SLUGS[type]),
		);
	}

	function eventMatchesMusic(event: TribeEvent, filters: Filters): boolean {
		if (!filters.music) return true;

		const categorySlugs =
			event.categories?.map((category) => category.slug) ?? [];
		return categorySlugs.includes(MUSIC_SLUGS[filters.music]);
	}

	function withFilteredEvents(state: EventStoreState): EventStoreState {
		const query = state.searchQuery.toLowerCase();
		const events = state.allEvents.filter((event) => {
			if (
				!eventMatchesTypes(event, state.filters) ||
				!eventMatchesMusic(event, state.filters)
			) {
				return false;
			}

			if (!state.searchQuery.trim()) {
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

		return {
			...state,
			events,
		};
	}

	async function loadEvents(forceRefresh = false) {
		const currentDate = get(store).filters.date;

		if (
			!forceRefresh &&
			lastFetchedDate === currentDate &&
			get(store).allEvents.length > 0
		) {
			update(withFilteredEvents);
			return;
		}

		const requestId = ++activeRequestId;
		update((state) => ({
			...state,
			loading: true,
			error: null,
		}));

		try {
			const fetchedEvents = await fetchAllEvents([], null, currentDate);

			if (requestId !== activeRequestId) {
				return;
			}

			lastFetchedDate = currentDate;
			lastFetchedMonthKey = null;
			update((state) =>
				withFilteredEvents({
					...state,
					allEvents: fetchedEvents,
					loading: false,
					error: null,
				}),
			);
		} catch (e) {
			if (requestId !== activeRequestId) {
				return;
			}

			update((state) => ({
				...state,
				loading: false,
				error: e instanceof Error ? e.message : "Failed to load events",
			}));
			trackFeatureEvent(
				"events",
				"api_error",
				e instanceof Error ? "fail" : "fetch_error",
			);
		}
	}

	async function loadCalendarMonth(monthDate: Date, forceRefresh = false) {
		const monthKey = getMonthKey(monthDate);

		if (
			!forceRefresh &&
			lastFetchedMonthKey === monthKey &&
			get(store).allEvents.length > 0
		) {
			update(withFilteredEvents);
			return;
		}

		const requestId = ++activeRequestId;
		update((state) => ({
			...state,
			loading: true,
			error: null,
		}));

		try {
			const fetchedEvents = await fetchAllEvents(
				[],
				null,
				'all',
				fetch,
				undefined,
				getMonthDateRange(monthDate),
			);

			if (requestId !== activeRequestId) {
				return;
			}

			lastFetchedMonthKey = monthKey;
			lastFetchedDate = null;
			update((state) =>
				withFilteredEvents({
					...state,
					allEvents: fetchedEvents,
					loading: false,
					error: null,
				}),
			);
		} catch (e) {
			if (requestId !== activeRequestId) {
				return;
			}

			update((state) => ({
				...state,
				loading: false,
				error: e instanceof Error ? e.message : 'Failed to load calendar events',
			}));
			trackFeatureEvent(
				'calendar',
				'api_error',
				e instanceof Error ? 'fail' : 'fetch_error',
			);
		}
	}

	function setFilters(newFilters: Partial<Filters>) {
		update((state) =>
			withFilteredEvents({
				...state,
				filters: { ...state.filters, ...newFilters },
			}),
		);
	}

	function toggleType(type: EventType) {
		const currentFilters = get(store).filters;
		const types = currentFilters.types.includes(type)
			? currentFilters.types.filter((t) => t !== type)
			: [...currentFilters.types, type];
		setFilters({ types });
	}

	function setMusic(music: MusicType | null) {
		setFilters({ music });
	}

	function toggleMusic(music: MusicType) {
		setMusic(get(store).filters.music === music ? null : music);
	}

	function setDateFilter(date: DateFilter) {
		if (get(store).filters.date === date) {
			return;
		}

		update((state) => ({
			...state,
			filters: { ...state.filters, date },
		}));
		void loadEvents();
	}

	function setSearchQuery(query: string) {
		update((state) => withFilteredEvents({ ...state, searchQuery: query }));
	}

	function clearSearch() {
		update((state) => withFilteredEvents({ ...state, searchQuery: "" }));
	}

	return {
		subscribe,
		loadEvents,
		loadCalendarMonth,
		setFilters,
		toggleType,
		setMusic,
		toggleMusic,
		setDateFilter,
		setSearchQuery,
		clearSearch,
	};
}

export const eventStore = createEventStore();
