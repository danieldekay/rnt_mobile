import { error } from '@sveltejs/kit';
import { fetchBlogPostBySlug } from '$lib/api/posts';
import { fetchWpContentSlugs } from '$lib/seo/wp-slugs';
import type { BlogPost } from '$lib/types';
import type { EntryGenerator, PageLoad } from './$types';

type BlogDetailPost = BlogPost & {
	content?: {
		rendered?: string;
	};
};

export const load: PageLoad = async ({ fetch, params }) => {
	const requestedSlug = params.slug.trim();

	if (!requestedSlug) {
		throw error(404, 'Beitrag nicht gefunden');
	}

	try {
		const post = (await fetchBlogPostBySlug(requestedSlug, fetch)) as BlogDetailPost | null;

		if (!post) {
			throw error(404, 'Beitrag nicht gefunden');
		}

		return {
			post
		};
	} catch (loadError) {
		if (typeof loadError === 'object' && loadError !== null && 'status' in loadError) {
			throw loadError;
		}

		console.error('Failed to load blog detail:', loadError);
		throw error(500, 'Blogbeitrag konnte nicht geladen werden');
	}
};

export const prerender = true;
export const ssr = true;

export const entries: EntryGenerator = async () => {
	const slugs = await fetchWpContentSlugs('posts');
	return slugs.map((slug) => ({ slug }));
};
