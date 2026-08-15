import { mapEventSeo } from "./from-event";
import { mapDjDetailSeo, mapOrganizerDetailSeo, mapVenueDetailSeo } from "./from-entity";
import { mapHubPageSeo } from "./pages";
import { renderHeadElements, type SeoMetadata } from "./metadata";
import type { TribeEvent, TribeOrganizer, TribeVenue } from "$lib/types";

const HUB_PATHS: Record<string, Parameters<typeof mapHubPageSeo>[0]> = {
	"/": "home",
	"/kalender": "kalender",
	"/blog": "blog",
	"/ankuendigungen": "ankuendigungen",
	"/djs": "djs",
	"/tanzraeume": "tanzraeume",
	"/veranstalter": "veranstalter",
	"/links": "links",
	"/newsletter": "newsletter",
	"/impressum": "impressum",
	"/datenschutz": "datenschutz",
	"/cookie-richtlinie": "cookie-richtlinie",
	"/was-ist-neu": "was-ist-neu",
	"/favoriten": "favoriten",
	"/offline": "offline",
};

type FetchLike = typeof fetch;

export function isHtmlDocumentRequest(request: Request): boolean {
	if (request.method !== "GET") return false;
	const accept = request.headers.get("accept") ?? "";
	return accept.includes("text/html");
}

export function shouldInjectHead(pathname: string): boolean {
	if (pathname.startsWith("/_app/")) return false;
	if (pathname.startsWith("/api/")) return false;
	if (pathname === "/sitemap.xml") return false;
	if (pathname.match(/\.[a-z0-9]+$/i)) return false;
	if (pathname.startsWith("/blog/")) return false;
	if (pathname.startsWith("/ankuendigungen/")) return false;
	return true;
}

export async function resolveSeoForPath(
	pathname: string,
	fetcher: FetchLike,
	origin: string,
): Promise<{ seo: SeoMetadata | null; status?: number }> {
	const hubKey = HUB_PATHS[pathname];
	if (hubKey) {
		return { seo: mapHubPageSeo(hubKey) };
	}

	const eventMatch = pathname.match(/^\/event\/(\d+)$/);
	if (eventMatch) {
		const eventId = Number.parseInt(eventMatch[1], 10);
		const response = await fetcher(`${origin}/api/events/${eventId}`);
		if (response.status === 404) {
			return { seo: mapHubPageSeo("error"), status: 404 };
		}
		if (!response.ok) return { seo: mapHubPageSeo("error") };
		const event = (await response.json()) as TribeEvent;
		return { seo: mapEventSeo(event) };
	}

	const organizerMatch = pathname.match(/^\/veranstalter\/([^/]+)$/);
	if (organizerMatch) {
		const slug = decodeURIComponent(organizerMatch[1]);
		const response = await fetcher(`${origin}/api/organizers`);
		if (!response.ok) return { seo: null };
		const data = (await response.json()) as { organizers?: TribeOrganizer[] };
		const organizer = data.organizers?.find((entry) => entry.slug === slug);
		if (!organizer) return { seo: mapHubPageSeo("error"), status: 404 };
		return { seo: mapOrganizerDetailSeo(organizer) };
	}

	const venueMatch = pathname.match(/^\/tanzraeume\/([^/]+)$/);
	if (venueMatch) {
		const slug = decodeURIComponent(venueMatch[1]);
		const response = await fetcher(`${origin}/api/venues`);
		if (!response.ok) return { seo: null };
		const data = (await response.json()) as { venues?: TribeVenue[] };
		const venue = data.venues?.find((entry) => entry.slug === slug);
		if (!venue) return { seo: mapHubPageSeo("error"), status: 404 };
		return { seo: mapVenueDetailSeo(venue, 0) };
	}

	const djMatch = pathname.match(/^\/djs\/([^/]+)$/);
	if (djMatch) {
		const slug = decodeURIComponent(djMatch[1]);
		return {
			seo: mapDjDetailSeo(
				slug.replace(/-/g, " "),
				slug,
				0,
			),
		};
	}

	return { seo: mapHubPageSeo("home") };
}

export function injectHeadIntoHtml(html: string, seo: SeoMetadata): string {
	const headMarkup = renderHeadElements(seo);
	const titleMatch = html.match(/<title>[^<]*<\/title>/i);
	if (titleMatch) {
		html = html.replace(titleMatch[0], `<title>${escapeForTitle(seo.title)}</title>`);
	}

	const descriptionPattern =
		/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i;
	if (descriptionPattern.test(html)) {
		html = html.replace(descriptionPattern, "");
	}

	if (html.includes("%sveltekit.head%")) {
		return html.replace("%sveltekit.head%", `${headMarkup}\n%sveltekit.head%`);
	}

	return html.replace("</head>", `${headMarkup}\n</head>`);
}

function escapeForTitle(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}
