import {
	fetchAllEvents,
	fetchDjCptList,
	fetchOrganizers,
	fetchVenues
} from '$lib/api/tribe';
import { getDjsFromCptAndEvents } from '$lib/utils/djs';
import type { DjProfileSummary, TribeOrganizer, TribeVenue } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const start = new Date();
		start.setHours(0, 0, 0, 0);
		const end = new Date(start);
		end.setDate(end.getDate() + 90);
		end.setHours(23, 59, 59, 999);

		const [events, organizers, venues, cptDjs] = await Promise.all([
			fetchAllEvents([], null, 'all', fetch, undefined, { start, end }),
			fetchOrganizers(fetch),
			fetchVenues(fetch),
			fetchDjCptList(fetch)
		]);

		const djs = getDjsFromCptAndEvents(cptDjs, events);

		return {
			events,
			organizers: organizers as TribeOrganizer[],
			venues: venues as TribeVenue[],
			djs: djs as DjProfileSummary[],
			loadError: false as const
		};
	} catch (error) {
		console.error('Failed to load favorites page data:', error);

		return {
			events: [],
			organizers: [] as TribeOrganizer[],
			venues: [] as TribeVenue[],
			djs: [] as DjProfileSummary[],
			loadError: true as const
		};
	}
};
