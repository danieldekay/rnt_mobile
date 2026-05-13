import { fetchBlogPosts } from '$lib/api/posts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const posts = await fetchBlogPosts(fetch);
		return {
			posts,
			loadError: false
		};
	} catch (error) {
		console.error('Failed to load blog posts:', error);

		return {
			posts: [],
			loadError: true
		};
	}
};
