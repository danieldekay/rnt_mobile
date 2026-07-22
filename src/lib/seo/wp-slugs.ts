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

		if (!response.ok) break;

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
