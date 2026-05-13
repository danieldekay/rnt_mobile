import type { BlogPost } from '$lib/types';

const WP_BASE = 'https://www.rhein-neckar-tango.de/wp-json/wp/v2';
const BLOG_API_BASE = '/api/posts';
const ANNOUNCEMENTS_API_BASE = '/api/announcements';

type FetchLike = typeof fetch;

function canRetryWithBrowserFetch(fetcher: FetchLike): boolean {
	return typeof window !== 'undefined' && fetcher !== globalThis.fetch;
}

async function fetchJsonWithFallback<T>(url: string, fetcher: FetchLike): Promise<T> {
	const requestInit = {
		headers: {
			Accept: 'application/json'
		}
	};

	let response = await fetcher(url, requestInit);

	if (!response.ok && response.status === 403 && canRetryWithBrowserFetch(fetcher)) {
		response = await globalThis.fetch(url, requestInit);
	}

	if (!response.ok) {
		throw new Error(`Failed to fetch content: ${response.status}`);
	}

	return (await response.json()) as T;
}

function normalizePerPage(perPage: number): number {
	if (!Number.isFinite(perPage)) return 20;
	return Math.min(50, Math.max(1, Math.trunc(perPage)));
}

export async function fetchBlogPosts(fetcher: FetchLike = fetch, perPage = 20): Promise<BlogPost[]> {
	const url = new URL(BLOG_API_BASE, 'http://localhost');
	url.searchParams.set('per_page', String(normalizePerPage(perPage)));
	url.searchParams.set('_embed', '');

	const payload = await fetchJsonWithFallback<BlogPost[]>(`${BLOG_API_BASE}?${url.searchParams.toString()}`, fetcher).catch((error) => {
		if (error instanceof Error && error.message.startsWith('Failed to fetch content:')) {
			throw new Error(error.message.replace('Failed to fetch content', 'Failed to fetch blog posts'));
		}

		throw error;
	});
	return Array.isArray(payload) ? payload : [];
}

export async function fetchBlogPostBySlug(
	slug: string,
	fetcher: FetchLike = fetch
): Promise<BlogPost | null> {
	const url = new URL(BLOG_API_BASE, 'http://localhost');
	url.searchParams.set('slug', slug);
	url.searchParams.set('_embed', '');

	const payload = await fetchJsonWithFallback<BlogPost[]>(`${BLOG_API_BASE}?${url.searchParams.toString()}`, fetcher).catch((error) => {
		if (error instanceof Error && error.message.startsWith('Failed to fetch content:')) {
			throw new Error(error.message.replace('Failed to fetch content', 'Failed to fetch blog post'));
		}

		throw error;
	});
	return Array.isArray(payload) ? payload[0] ?? null : null;
}

export async function fetchAnnouncements(
	fetcher: FetchLike = fetch,
	perPage = 20
): Promise<BlogPost[]> {
	const url = new URL(ANNOUNCEMENTS_API_BASE, 'http://localhost');
	url.searchParams.set('per_page', String(normalizePerPage(perPage)));
	url.searchParams.set('_embed', '');

	const payload = await fetchJsonWithFallback<BlogPost[]>(`${ANNOUNCEMENTS_API_BASE}?${url.searchParams.toString()}`, fetcher).catch((error) => {
		if (error instanceof Error && error.message.startsWith('Failed to fetch content:')) {
			throw new Error(error.message.replace('Failed to fetch content', 'Failed to fetch announcements'));
		}

		throw error;
	});
	return Array.isArray(payload) ? payload : [];
}

export async function fetchAnnouncementBySlug(
	slug: string,
	fetcher: FetchLike = fetch
): Promise<BlogPost | null> {
	const url = new URL(ANNOUNCEMENTS_API_BASE, 'http://localhost');
	url.searchParams.set('slug', slug);
	url.searchParams.set('_embed', '');

	const payload = await fetchJsonWithFallback<BlogPost[]>(`${ANNOUNCEMENTS_API_BASE}?${url.searchParams.toString()}`, fetcher).catch((error) => {
		if (error instanceof Error && error.message.startsWith('Failed to fetch content:')) {
			throw new Error(error.message.replace('Failed to fetch content', 'Failed to fetch announcement'));
		}

		throw error;
	});
	return Array.isArray(payload) ? payload[0] ?? null : null;
}
