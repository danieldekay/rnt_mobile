import { decode as decodeHtmlEntities } from "he";

export interface CuratedLink {
	title: string;
	url: string;
	description: string;
	category: string;
}

const LINKS_API_URL = "/api/links";
const DEV_WORKER_URL = "http://localhost:8787";

function extractField(xml: string, field: string): string | null {
	const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const cdDataRegex = new RegExp(
		`<${escapedField}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${escapedField}>`,
		"i",
	);
	const textRegex = new RegExp(
		`<${escapedField}[^>]*>([\\s\\S]*?)<\\/${escapedField}>`,
		"i",
	);

	let match = cdDataRegex.exec(xml);
	if (match && match[1] !== undefined) {
		const raw = match[1].trim();
		const decoded = decodeHtmlEntities(raw);
		// Decode twice to handle double-encoded entities like &amp;amp;
		return decodeHtmlEntities(decoded) || null;
	}

	match = textRegex.exec(xml);
	if (match && match[1] !== undefined) {
		const raw = match[1].trim();
		const decoded = decodeHtmlEntities(raw);
		// Decode twice to handle double-encoded entities like &amp;amp;
		return decodeHtmlEntities(decoded) || null;
	}

	return null;
}

function parseRssFeed(xml: string): CuratedLink[] {
	const links: CuratedLink[] = [];
	const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
	let itemMatch: RegExpExecArray | null;
	let skipped = 0;

	while ((itemMatch = itemRegex.exec(xml)) !== null) {
		const itemXml = itemMatch[1];
		const title = extractField(itemXml, "title");
		const url = extractField(itemXml, "link");
		const description = extractField(itemXml, "description");
		const category = extractField(itemXml, "category");

		if (title && url) {
			links.push({
				title: title.trim(),
				url: url.trim(),
				description: description?.trim() ?? "",
				category: category?.trim() ?? "Allgemein",
			});
		} else {
			skipped++;
		}
	}

	console.log(
		`[links] RSS parser: ${links.length} links extracted, ${skipped} items skipped`,
	);
	return links;
}

function getApiUrl(): string {
	if (typeof window !== "undefined") {
		const isDev =
			window.location.hostname === "localhost" ||
			window.location.hostname === "127.0.0.1";
		return isDev ? DEV_WORKER_URL + LINKS_API_URL : LINKS_API_URL;
	}
	return LINKS_API_URL;
}

export async function fetchLinks(
	fetcher?: typeof fetch,
): Promise<CuratedLink[]> {
	const doFetch = fetcher ?? fetch;
	const apiUrl = getApiUrl();

	try {
		console.log("[links] Fetching from API:", apiUrl);
		const response = await doFetch(apiUrl);
		console.log("[links] API response status:", response.status);

		if (!response.ok) {
			console.warn("[links] API returned non-OK status:", response.status);
			return [];
		}

		const xml = await response.text();
		console.log("[links] XML received, length:", xml.length, "chars");
		const links = parseRssFeed(xml);
		console.log("[links] Parsed links count:", links.length);

		if (links.length === 0) {
			console.warn("[links] Feed contained no valid items");
			return [];
		}

		return links;
	} catch (error) {
		console.warn("[links] Failed to fetch:", error);
		return [];
	}
}
