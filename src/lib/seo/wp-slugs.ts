import { WORDPRESS_ORIGIN } from "$lib/constants";

type WpSlugEntry = { slug?: string };

export async function fetchWpContentSlugs(
	restPath: string,
	fetcher: typeof fetch = fetch,
): Promise<string[]> {
	const slugs: string[] = [];
	const base = `${WORDPRESS_ORIGIN}/wp-json/wp/v2/${restPath}`;
	let page = 1;

	while (page <= 50) {
		const url = new URL(base);
		url.searchParams.set("per_page", "100");
		url.searchParams.set("page", String(page));
		url.searchParams.set("_fields", "slug");
		url.searchParams.set("status", "publish");

		const response = await fetcher(url.toString(), {
			headers: { Accept: "application/json" },
		});

		if (response.status === 400 && page > 1) break;
		if (!response.ok) {
			throw new Error(`Failed to fetch ${restPath} slugs: HTTP ${response.status} on page ${page}`);
		}

		const batch = (await response.json()) as WpSlugEntry[];
		if (!Array.isArray(batch) || batch.length === 0) break;

		for (const item of batch) {
			if (item.slug) slugs.push(item.slug);
		}

		if (batch.length < 100) break;
		page += 1;
	}

	return slugs;
}
