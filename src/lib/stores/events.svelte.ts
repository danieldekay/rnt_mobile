import { fetchAllEvents, extractDjFromDescription } from '$lib/api/tribe';
import type { TribeEvent, EventType, MusicType, DateFilter, Filters } from '$lib/types';

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

	let lastFetchParams = $state<{ types: EventType[]; music: MusicType | null; date: DateFilter } | null>(null);

	function getFilteredEvents(): TribeEvent[] {
		if (!searchQuery.trim()) return events;
		const query = searchQuery.toLowerCase();
		return events.filter((event) => {
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
		const currentParams = { ...filters };
		
		if (!forceRefresh && lastFetchParams && 
			JSON.stringify(currentParams) === JSON.stringify(lastFetchParams) && 
			events.length > 0) {
			return;
		}

		loading = true;
		error = null;

		try {
			const fetchedEvents = await fetchAllEvents(
				currentParams.types,
				currentParams.music,
				currentParams.date
			);
			events = fetchedEvents;
			lastFetchParams = currentParams;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load events';
		} finally {
			loading = false;
		}
	}

	function setFilters(newFilters: Partial<Filters>) {
		filters = { ...filters, ...newFilters };
		loadEvents(true);
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
		setFilters({ date });
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
