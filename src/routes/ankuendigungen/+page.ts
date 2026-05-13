import { fetchAnnouncements } from '$lib/api/posts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const posts = await fetchAnnouncements(fetch);
		return {
			posts,
			loadError: false
		};
	} catch (error) {
		console.error('Failed to load announcements:', error);

		return {
			posts: [],
			loadError: true
		};
	}
};