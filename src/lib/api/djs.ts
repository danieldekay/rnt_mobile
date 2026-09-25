/**
 * DJ custom post type fetching and DJ/workshop extraction from event descriptions.
 */

import type { TribeEvent } from "$lib/types";
import { normalizeText, stripHtmlToPlainText } from "./normalizers";

const DJ_API_BASE = "https://www.rhein-neckar-tango.de/wp-json/wp/v2/dj";
const DJ_MENTION = /\bdj(?:ane|s)?\b\s*[:-]?\s*([^\n]+)/gi;
const NEXT_EVENT_MENTION =
	/\b(?:nächste[rsn]?|kommende[rsn]?)\s+(?:milonga|veranstaltung|termin|event|tanzabend)\b/i;
const CURRENT_EVENT_DETAILS = /^kurz\s*(?:&|und)\s*knapp\b/i;

// --- DJ name extraction ---

export function cleanDjCandidate(candidate: string): string {
	return normalizeText(candidate)
		.replace(/^[-–—:|/]+/, "")
		.replace(/^["'„"‚'"]+|["'„"‚'"]+$/g, "")
		.replace(/[|•].*$/, "")
		.replace(/[.?!]+$/g, "")
		.replace(/\s+(?:aus|von)\s+[A-ZÄÖÜ][^,.;?]*$/u, "")
		.replace(/\s+\([A-ZÄÖÜ][^()]{1,35}\)$/u, "")
		.replace(
			/\s+(?:für|für|spielt|legt|sorgt|an\s+den\s+(?:decks|turntables)|heute|heut[e]?|live)\b.*$/i,
			"",
		)
		.replace(
			/[.!?]\s+(?:wir|tanzen|im|in|am|mit|beginn|eintritt|details?)\b.*$/i,
			"",
		)
		.replace(/\s{2,}/g, " ")
		.trim();
}

function isPlausibleDjName(value: string): boolean {
	if (!value) return false;
	if (value.length > 48) return false;
	if (/\d/.test(value)) return false;
	if (!/[A-Za-zÄÖÜäöüß]/.test(value)) return false;
	if (/[,:;]/.test(value)) return false;
	if (
		/\b(wir|tanzen|saal|uhr|beginn|eintritt|workshop|milonga|practica|kurs|anmeldung|details?|tickets?|homepage|website|webseite|siehe|klassisch|tandas?|cortinas?|ueberwiegend|überwiegend|sorgen?)\b/i.test(
			value,
		)
	) {
		return false;
	}

	const wordCount = value
		.split(/\s+/)
		.map((part) => part.trim())
		.filter(Boolean).length;

	if (wordCount === 1 && value === value.toLocaleLowerCase("de")) {
		return false;
	}

	return wordCount > 0 && wordCount <= 6;
}

export function extractDjFromDescription(event: TribeEvent): string | null {
	const description = stripHtmlToPlainText(event.description);
	const candidates: string[] = [];
	const musicCredits: string[] = [];
	let inNextEventSection = false;

	for (const rawLine of description.split("\n")) {
		let line = rawLine.trim();
		if (CURRENT_EVENT_DETAILS.test(line)) inNextEventSection = false;

		const nextEventIndex = line.search(NEXT_EVENT_MENTION);
		if (nextEventIndex >= 0) {
			line = inNextEventSection ? "" : line.slice(0, nextEventIndex).trim();
			inNextEventSection = true;
		} else if (inNextEventSection) {
			continue;
		}

		if (/^musik\s*:/i.test(line)) musicCredits.push(line.toLocaleLowerCase("de"));

		for (const djMatch of line.matchAll(DJ_MENTION)) {
			const firstDj = (djMatch[1] ?? "").split(/\s+(?:&|und)\s+|,\s*(?=[A-ZÄÖÜ])/i)[0];
			const candidate = cleanDjCandidate(firstDj ?? "");
			if (isPlausibleDjName(candidate)) {
				candidates.push(candidate);
			}
		}
	}

	return (
		candidates.find((candidate) =>
			musicCredits.some((credit) => credit.includes(candidate.toLocaleLowerCase("de"))),
		) ?? candidates[0] ?? null
	);
}

export function extractWorkshopFromDescription(
	event: TribeEvent,
): string | null {
	const description = event.description || "";
	const workshopMatch = description.match(/Workshops?[:\s]+([^<,\n]+)/i);
	return workshopMatch ? normalizeText(workshopMatch[1]) : null;
}

// --- DJ CPT fetching ---

type DjCptRawEntry = {
	id?: number;
	slug?: string;
	title?: { rendered?: string };
	meta_box?: Record<string, unknown>;
};

export async function fetchDjCptList(
	fetcher: typeof fetch = fetch,
): Promise<import("$lib/types").DjCptEntry[]> {
	const url = `${DJ_API_BASE}?per_page=100&_fields=id,slug,title,meta_box&orderby=title&order=asc`;
	const response = await fetcher(url);
	if (!response.ok) return [];
	const raw = (await response.json()) as DjCptRawEntry[];
	if (!Array.isArray(raw)) return [];
	return raw
		.map((entry) => ({
			id: typeof entry.id === "number" ? entry.id : 0,
			slug: typeof entry.slug === "string" ? entry.slug.trim() : "",
			name:
				typeof entry.title?.rendered === "string"
					? entry.title.rendered.trim()
					: "",
			meta_box: entry.meta_box,
		}))
		.filter(
			(entry) => entry.id > 0 && entry.slug.length > 0 && entry.name.length > 0,
		);
}

export async function fetchDjCptBySlug(
	slug: string,
	fetcher: typeof fetch = fetch,
): Promise<import("$lib/types").DjCptEntry | null> {
	const url = `${DJ_API_BASE}?slug=${encodeURIComponent(slug)}&_fields=id,slug,title,meta_box`;
	const response = await fetcher(url);
	if (!response.ok) return null;
	const raw = (await response.json()) as DjCptRawEntry[];
	if (!Array.isArray(raw) || raw.length === 0) return null;
	const entry = raw[0];
	return {
		id: typeof entry.id === "number" ? entry.id : 0,
		slug: typeof entry.slug === "string" ? entry.slug.trim() : "",
		name:
			typeof entry.title?.rendered === "string"
				? entry.title.rendered.trim()
				: "",
		meta_box: entry.meta_box,
	};
}
