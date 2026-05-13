import { fetchLinks } from "$lib/api/links";
import { LINKS, CATEGORIES } from "$lib/content/links";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
	try {
		const apiLinks = await fetchLinks(fetch);
		if (apiLinks.length > 0) {
			const categories = Array.from(new Set(apiLinks.map((l) => l.category)));
			return { links: apiLinks, categories };
		}
	} catch (error) {
		console.error("[links] Failed to load links from API:", error);
	}

	// Fallback to static data
	console.warn("[links] Using static fallback data");
	return { links: LINKS, categories: CATEGORIES };
};
