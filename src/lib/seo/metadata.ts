import { MOBILE_ORIGIN } from "./sitemap";

export const SITE_NAME = "Rhein-Neckar-Tango";
export const DEFAULT_OG_IMAGE = `${MOBILE_ORIGIN}/screenshots/home-screen.png`;
export const DEFAULT_ROBOTS = "index, follow";

export type SeoMetadata = {
	title: string;
	description: string;
	canonical: string;
	robots: string;
	image?: string;
	jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export function mobileCanonical(path: string): string {
	const normalized = path.startsWith("/") ? path : `/${path}`;
	return `${MOBILE_ORIGIN}${normalized}`;
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

export function renderHeadElements(seo: SeoMetadata): string {
	const parts: string[] = [
		`<title>${escapeHtml(seo.title)}</title>`,
		`<meta name="description" content="${escapeHtml(seo.description)}" />`,
		`<link rel="canonical" href="${escapeHtml(seo.canonical)}" />`,
		`<meta name="robots" content="${escapeHtml(seo.robots)}" />`,
		`<meta property="og:type" content="website" />`,
		`<meta property="og:locale" content="de_DE" />`,
		`<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
		`<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
		`<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
		`<meta property="og:url" content="${escapeHtml(seo.canonical)}" />`,
		`<meta name="twitter:card" content="summary_large_image" />`,
		`<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
		`<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
	];

	const image = seo.image ?? DEFAULT_OG_IMAGE;
	parts.push(`<meta property="og:image" content="${escapeHtml(image)}" />`);
	parts.push(`<meta name="twitter:image" content="${escapeHtml(image)}" />`);

	if (seo.jsonLd) {
		parts.push(
			`<script type="application/ld+json">${JSON.stringify(seo.jsonLd)}</script>`,
		);
	}

	return parts.join("\n");
}
