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
const REQUEST_TIMEOUT_MS = 8000;

type WpSitemapEntry = {
	slug: string;
	modified?: string;
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
	const [posts, announcements] = await Promise.all([
		fetchWpSitemapEntries(WP_POSTS_BASE_URL, fetcher),
		fetchWpSitemapEntries(WP_ANNOUNCEMENTS_BASE_URL, fetcher),
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

	return buildSitemapXml(urls);
}
