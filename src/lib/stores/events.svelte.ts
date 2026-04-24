import { fetchAllEvents, extractDjFromDescription } from '$lib/api/tribe';
import type { TribeEvent, EventType, MusicType, DateFilter, Filters } from '$lib/types';

const EVENT_TYPE_CATEGORY_SLUGS: Record<EventType, string> = {
	milonga: 'typ_milonga',
	practica: 'typ_practica',
	workshop: 'typ_workshop',
	kurs: 'typ_kurs'
};

const MUSIC_CATEGORY_SLUGS: Record<MusicType, string> = {
	traditional: 'musik_traditionell',
	mixed: 'musik_gemischt',
	neo: 'musik_neo-oder-non'
};

function createEventStore() {
	let events = $state<TribeEvent[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let searchQuery = $state('');
	let filters = $state<Filters>({
		types: [],
		music: null,
		date: 'week'
	});

	let lastFetchedDate = $state<DateFilter | null>(null);
	let activeRequestId = 0;

	function eventMatchesTypes(event: TribeEvent): boolean {
		if (filters.types.length === 0) return true;

		const categorySlugs = event.categories?.map((category) => category.slug) ?? [];
		return filters.types.some((type) => categorySlugs.includes(EVENT_TYPE_CATEGORY_SLUGS[type]));
	}

	function eventMatchesMusic(event: TribeEvent): boolean {
		if (!filters.music) return true;

		const categorySlugs = event.categories?.map((category) => category.slug) ?? [];
		return categorySlugs.includes(MUSIC_CATEGORY_SLUGS[filters.music]);
	}

	function getFilteredEvents(): TribeEvent[] {
		const query = searchQuery.toLowerCase();
		return events.filter((event) => {
			if (!eventMatchesTypes(event) || !eventMatchesMusic(event)) {
				return false;
			}

			if (!searchQuery.trim()) {
				return true;
			}

			const title = event.title?.toLowerCase() ?? '';
			const venue = event.venue?.venue?.toLowerCase() ?? '';
			const city = event.venue?.city?.toLowerCase() ?? '';
			const description = event.description?.toLowerCase() ?? '';
			const dj = extractDjFromDescription(event)?.toLowerCase() ?? '';
			const organizer = event.organizer?.[0]?.organizer?.toLowerCase() ?? '';
			return title.includes(query) || venue.includes(query) || city.includes(query) || description.includes(query) || dj.includes(query) || organizer.includes(query);
		});
	}

	async function loadEvents(forceRefresh = false) {
		const currentDate = filters.date;
		
		if (!forceRefresh && lastFetchedDate === currentDate && events.length > 0) {
			return;
		}

		const requestId = ++activeRequestId;
		loading = true;
		error = null;

		try {
			const fetchedEvents = await fetchAllEvents([], null, currentDate);

			if (requestId !== activeRequestId) {
				return;
			}

			events = fetchedEvents;
			lastFetchedDate = currentDate;
		} catch (e) {
			if (requestId !== activeRequestId) {
				return;
			}

			error = e instanceof Error ? e.message : 'Failed to load events';
		} finally {
			if (requestId === activeRequestId) {
				loading = false;
			}
		}
	}

	function setFilters(newFilters: Partial<Filters>) {
		filters = { ...filters, ...newFilters };
	}

	function toggleType(type: EventType) {
		const types = filters.types.includes(type)
			? filters.types.filter((t) => t !== type)
			: [...filters.types, type];
		setFilters({ types });
	}

	function setMusic(music: MusicType | null) {
		setFilters({ music });
	}

	function toggleMusic(music: MusicType) {
		setMusic(filters.music === music ? null : music);
	}

	function setDateFilter(date: DateFilter) {
		if (filters.date === date) {
			return;
		}

		filters = { ...filters, date };
		void loadEvents();
	}

	function setSearchQuery(query: string) {
		searchQuery = query;
	}

	function clearSearch() {
		searchQuery = '';
	}

	return {
		get events() { return getFilteredEvents(); },
		get allEvents() { return events; },
		get loading() { return loading; },
		get error() { return error; },
		get filters() { return filters; },
		get searchQuery() { return searchQuery; },
		loadEvents,
		setFilters,
		toggleType,
		setMusic,
		toggleMusic,
		setDateFilter,
		setSearchQuery,
		clearSearch
	};
}

export const eventStore = createEventStore();
