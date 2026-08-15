import { WORDPRESS_ORIGIN } from "../constants";

export const SITEMAP_PATH = "/sitemap.xml";
export const MOBILE_ORIGIN = "https://mobile.rhein-neckar-tango.de";
export const SITEMAP_CACHE_CONTROL =
	"public, s-maxage=60, stale-while-revalidate=300";

export const STATIC_SITEMAP_PATHS = [
	"",
	"/blog",
	"/ankuendigungen",
	"/kalender",
	"/djs",
	"/tanzraeume",
	"/veranstalter",
	"/links",
	"/newsletter",
	"/impressum",
	"/datenschutz",
	"/cookie-richtlinie",
	"/was-ist-neu",
] as const;

const WP_POSTS_BASE_URL = `${WORDPRESS_ORIGIN}/wp-json/wp/v2/posts`;
const WP_ANNOUNCEMENTS_BASE_URL = `${WORDPRESS_ORIGIN}/wp-json/wp/v2/ankuendigung`;
const TRIBE_EVENTS_BASE_URL = `${WORDPRESS_ORIGIN}/wp-json/tribe/events/v1/events`;
const TRIBE_VENUES_BASE_URL = `${WORDPRESS_ORIGIN}/wp-json/tribe/events/v1/venues`;
const TRIBE_ORGANIZERS_BASE_URL = `${WORDPRESS_ORIGIN}/wp-json/tribe/events/v1/organizers`;
const WP_DJ_CPT_BASE_URL = `${WORDPRESS_ORIGIN}/wp-json/wp/v2/dj`;
const REQUEST_TIMEOUT_MS = 8000;

type WpSitemapEntry = {
	slug: string;
	modified?: string;
};

type TribeEventSitemapEntry = {
	id: number;
	modified?: string;
	end_date: string;
};

type SlugSitemapEntry = {
	slug: string;
};

type FetchLike = typeof fetch;

async function fetchWithTimeout(
	input: string,
	fetcher: FetchLike = fetch,
): Promise<Response> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		return await fetcher(input, {
			method: "GET",
			headers: { accept: "application/json" },
			signal: controller.signal,
		});
	} finally {
		clearTimeout(timeout);
	}
}

async function fetchWpSitemapEntries(
	baseUrl: string,
	fetcher: FetchLike = fetch,
): Promise<WpSitemapEntry[]> {
	const entries: WpSitemapEntry[] = [];
	let page = 1;

	while (page <= 50) {
		const url = new URL(baseUrl);
		url.searchParams.set("per_page", "100");
		url.searchParams.set("page", String(page));
		url.searchParams.set("_fields", "slug,modified");
		url.searchParams.set("status", "publish");

		const response = await fetchWithTimeout(url.toString(), fetcher);
		if (!response.ok) break;

		const batch = (await response.json()) as Array<{
			slug?: string;
			modified?: string;
		}>;

		if (!Array.isArray(batch) || batch.length === 0) break;

		for (const item of batch) {
			if (item.slug) {
				entries.push({ slug: item.slug, modified: item.modified });
			}
		}

		if (batch.length < 100) break;
		page += 1;
	}

	return entries;
}

async function fetchUpcomingEvents(
	fetcher: FetchLike = fetch,
): Promise<TribeEventSitemapEntry[]> {
	const entries: TribeEventSitemapEntry[] = [];
	const now = new Date();
	const start = new Date(now);
	start.setHours(0, 0, 0, 0);
	const end = new Date(start);
	end.setFullYear(end.getFullYear() + 1);

	const formatDate = (date: Date) => {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const d = String(date.getDate()).padStart(2, "0");
		const h = String(date.getHours()).padStart(2, "0");
		const min = String(date.getMinutes()).padStart(2, "0");
		const s = String(date.getSeconds()).padStart(2, "0");
		return `${y}-${m}-${d} ${h}:${min}:${s}`;
	};

	let page = 1;
	while (page <= 30) {
		const url = new URL(TRIBE_EVENTS_BASE_URL);
		url.searchParams.set("per_page", "100");
		url.searchParams.set("page", String(page));
		url.searchParams.set("start_date", formatDate(start));
		url.searchParams.set("end_date", formatDate(end));
		url.searchParams.set("status", "publish");

		const response = await fetchWithTimeout(url.toString(), fetcher);
		if (!response.ok) break;

		const data = (await response.json()) as {
			events?: Array<{
				id?: number;
				modified?: string;
				end_date?: string;
			}>;
			total_pages?: number;
		};

		const batch = data.events ?? [];
		if (batch.length === 0) break;

		for (const item of batch) {
			if (!item.id || !item.end_date) continue;
			const end = new Date(item.end_date);
			if (end.getTime() < Date.now()) continue;
			entries.push({
				id: item.id,
				modified: item.modified,
				end_date: item.end_date,
			});
		}

		if (page >= (data.total_pages ?? 1)) break;
		page += 1;
	}

	return entries;
}

async function fetchTribeSlugs(
	baseUrl: string,
	collectionKey: "venues" | "organizers",
	fetcher: FetchLike = fetch,
): Promise<SlugSitemapEntry[]> {
	const entries: SlugSitemapEntry[] = [];
	let page = 1;

	while (page <= 30) {
		const url = new URL(baseUrl);
		url.searchParams.set("per_page", "100");
		url.searchParams.set("page", String(page));

		const response = await fetchWithTimeout(url.toString(), fetcher);
		if (!response.ok) break;

		const data = (await response.json()) as Record<
			string,
			Array<{ slug?: string }> | undefined
		>;
		const batch = data[collectionKey] ?? [];
		if (batch.length === 0) break;

		for (const item of batch) {
			if (item.slug) entries.push({ slug: item.slug });
		}

		if (batch.length < 100) break;
		page += 1;
	}

	return entries;
}

async function fetchDjSlugs(fetcher: FetchLike = fetch): Promise<SlugSitemapEntry[]> {
	const entries: SlugSitemapEntry[] = [];
	let page = 1;

	while (page <= 30) {
		const url = new URL(WP_DJ_CPT_BASE_URL);
		url.searchParams.set("per_page", "100");
		url.searchParams.set("page", String(page));
		url.searchParams.set("_fields", "slug");
		url.searchParams.set("status", "publish");

		const response = await fetchWithTimeout(url.toString(), fetcher);
		if (!response.ok) break;

		const batch = (await response.json()) as Array<{ slug?: string }>;
		if (!Array.isArray(batch) || batch.length === 0) break;

		for (const item of batch) {
			if (item.slug) entries.push({ slug: item.slug });
		}

		if (batch.length < 100) break;
		page += 1;
	}

	return entries;
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function formatSitemapLastmod(modified?: string): string | undefined {
	if (!modified) return undefined;
	const parsed = new Date(modified);
	if (Number.isNaN(parsed.getTime())) return undefined;
	return parsed.toISOString().slice(0, 10);
}

export function buildSitemapXml(
	urls: Array<{ loc: string; lastmod?: string }>,
): string {
	const body = urls
		.map((url) => {
			const lastmodLine = url.lastmod
				? `\n    <lastmod>${escapeXml(url.lastmod)}</lastmod>`
				: "";
			return `  <url>\n    <loc>${escapeXml(url.loc)}</loc>${lastmodLine}\n  </url>`;
		})
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

export async function generateSitemapXml(
	fetcher: FetchLike = fetch,
): Promise<string> {
	const [posts, announcements, events, venues, organizers, djs] =
		await Promise.all([
			fetchWpSitemapEntries(WP_POSTS_BASE_URL, fetcher),
			fetchWpSitemapEntries(WP_ANNOUNCEMENTS_BASE_URL, fetcher),
			fetchUpcomingEvents(fetcher),
			fetchTribeSlugs(TRIBE_VENUES_BASE_URL, "venues", fetcher),
			fetchTribeSlugs(TRIBE_ORGANIZERS_BASE_URL, "organizers", fetcher),
			fetchDjSlugs(fetcher),
		]);

	const urls: Array<{ loc: string; lastmod?: string }> = [];

	for (const path of STATIC_SITEMAP_PATHS) {
		urls.push({ loc: `${MOBILE_ORIGIN}${path}` });
	}

	for (const post of posts) {
		urls.push({
			loc: `${MOBILE_ORIGIN}/blog/${post.slug}`,
			lastmod: formatSitemapLastmod(post.modified),
		});
	}

	for (const announcement of announcements) {
		urls.push({
			loc: `${MOBILE_ORIGIN}/ankuendigungen/${announcement.slug}`,
			lastmod: formatSitemapLastmod(announcement.modified),
		});
	}

	for (const event of events) {
		urls.push({
			loc: `${MOBILE_ORIGIN}/event/${event.id}`,
			lastmod: formatSitemapLastmod(event.modified),
		});
	}

	for (const venue of venues) {
		urls.push({ loc: `${MOBILE_ORIGIN}/tanzraeume/${venue.slug}` });
	}

	for (const organizer of organizers) {
		urls.push({ loc: `${MOBILE_ORIGIN}/veranstalter/${organizer.slug}` });
	}

	for (const dj of djs) {
		urls.push({ loc: `${MOBILE_ORIGIN}/djs/${dj.slug}` });
	}

	return buildSitemapXml(urls);
}
