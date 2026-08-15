import { DEFAULT_ROBOTS, mobileCanonical, type SeoMetadata } from "./metadata";

type HubPageKey =
	| "home"
	| "kalender"
	| "blog"
	| "ankuendigungen"
	| "djs"
	| "tanzraeume"
	| "veranstalter"
	| "links"
	| "newsletter"
	| "impressum"
	| "datenschutz"
	| "cookie-richtlinie"
	| "was-ist-neu"
	| "favoriten"
	| "offline"
	| "error";

const HUB_PAGES: Record<
	HubPageKey,
	{ path: string; title: string; description: string; robots?: string }
> = {
	home: {
		path: "/",
		title: "RNT Kalender – Tango Events Rhein-Neckar",
		description:
			"Milongas, Practicas, Workshops und Kurse in der Rhein-Neckar-Region. Aktueller Tango-Kalender für Heidelberg, Mannheim, Karlsruhe und Umgebung.",
	},
	kalender: {
		path: "/kalender",
		title: "Kalender – RNT Kalender",
		description:
			"Monatsansicht aller Tango-Veranstaltungen in der Rhein-Neckar-Region.",
	},
	blog: {
		path: "/blog",
		title: "Blog – RNT Kalender",
		description: "Neuigkeiten und Beiträge aus der Rhein-Neckar-Tango Community.",
	},
	ankuendigungen: {
		path: "/ankuendigungen",
		title: "Ankündigungen – RNT Kalender",
		description: "Aktuelle Ankündigungen und Hinweise der Tango-Community.",
	},
	djs: {
		path: "/djs",
		title: "DJs – RNT Kalender",
		description: "DJ-Profile und kommende Auftritte in der Rhein-Neckar-Region.",
	},
	tanzraeume: {
		path: "/tanzraeume",
		title: "Tanzräume – RNT Kalender",
		description: "Tango-Veranstaltungsorte und Tanzräume in der Region.",
	},
	veranstalter: {
		path: "/veranstalter",
		title: "Veranstalter – RNT Kalender",
		description: "Tango-Veranstalter, Schulen und Organisatoren in der Region.",
	},
	links: {
		path: "/links",
		title: "Links & Ressourcen – RNT Kalender",
		description: "Nützliche Links rund um Tango Argentino in der Region.",
	},
	newsletter: {
		path: "/newsletter",
		title: "Newsletter – RNT Kalender",
		description: "RNT-Newsletter abonnieren für wöchentliche Terminübersichten.",
	},
	impressum: {
		path: "/impressum",
		title: "Impressum – RNT Kalender",
		description: "Impressum und rechtliche Angaben.",
	},
	datenschutz: {
		path: "/datenschutz",
		title: "Datenschutzerklärung – RNT Kalender",
		description: "Datenschutzerklärung der RNT Kalender App.",
	},
	"cookie-richtlinie": {
		path: "/cookie-richtlinie",
		title: "Cookie-Richtlinie – RNT Kalender",
		description: "Informationen zur Cookie-Nutzung.",
	},
	"was-ist-neu": {
		path: "/was-ist-neu",
		title: "Was ist neu? – RNT Kalender",
		description: "Neuigkeiten und Änderungen an der RNT Kalender App.",
	},
	favoriten: {
		path: "/favoriten",
		title: "Favoriten – RNT Kalender",
		description: "Deine gespeicherten Tango-Veranstaltungen.",
		robots: "noindex, follow",
	},
	offline: {
		path: "/offline",
		title: "Offline – RNT Kalender",
		description: "Die App ist offline.",
		robots: "noindex, follow",
	},
	error: {
		path: "/",
		title: "Fehler – RNT Kalender",
		description: "Ein Fehler ist aufgetreten.",
		robots: "noindex, follow",
	},
};

export function mapHubPageSeo(key: HubPageKey): SeoMetadata {
	const page = HUB_PAGES[key];
	return {
		title: page.title,
		description: page.description,
		canonical: mobileCanonical(page.path),
		robots: page.robots ?? DEFAULT_ROBOTS,
	};
}

export function mapOrganizerSeo(
	name: string,
	description: string | null | undefined,
	slug: string,
	jsonLd?: Record<string, unknown>,
): SeoMetadata {
	const plain =
		description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";
	const desc =
		plain.length > 0
			? plain.slice(0, 160)
			: `Veranstalter ${name} – kommende Tango-Events in der Rhein-Neckar-Region.`;

	return {
		title: `${name} | Rhein-Neckar-Tango`,
		description: desc,
		canonical: mobileCanonical(`/veranstalter/${slug}`),
		robots: DEFAULT_ROBOTS,
		jsonLd,
	};
}

export function mapVenueSeo(
	name: string,
	city: string | null | undefined,
	slug: string,
	upcomingCount: number,
	jsonLd?: Record<string, unknown>,
): SeoMetadata {
	const location = city ? `${name} in ${city}` : name;
	const desc =
		upcomingCount > 0
			? `${location} – ${upcomingCount} kommende Tango-Veranstaltung${upcomingCount === 1 ? "" : "en"}.`
			: `${location} – Tanzraum und Veranstaltungsort für Tango Argentino.`;

	return {
		title: `${name} | Rhein-Neckar-Tango`,
		description: desc,
		canonical: mobileCanonical(`/tanzraeume/${slug}`),
		robots: DEFAULT_ROBOTS,
		jsonLd,
	};
}

export function mapDjSeo(name: string, slug: string, upcomingCount: number): SeoMetadata {
	const desc =
		upcomingCount > 0
			? `DJ ${name} – ${upcomingCount} kommende Auftritt${upcomingCount === 1 ? "" : "e"} in der Rhein-Neckar-Region.`
			: `DJ ${name} – Tango-DJ in der Rhein-Neckar-Region.`;

	return {
		title: `${name} – DJs | Rhein-Neckar-Tango`,
		description: desc,
		canonical: mobileCanonical(`/djs/${slug}`),
		robots: DEFAULT_ROBOTS,
	};
}
