import { browser } from "$app/environment";
import DOMPurify from "dompurify";
import he from "he";

function stripInvalidHrefAttributes(html: string): string {
	return html.replace(/\shref=(["'])(.*?)\1/gi, (match, _quote, href) => {
		try {
			new URL(href);
			return match;
		} catch {
			return "";
		}
	});
}

function cleanupGeoHtml(html: string): string {
	return stripInvalidHrefAttributes(html)
		.replace(/<div\b[^>]*>\s*<\/div>/gi, "")
		.replace(/\sclass=""/gi, "");
}

function serverSanitizeHtml(html: string): string {
	return cleanupGeoHtml(
		html
			.replace(/<script[\s\S]*?<\/script>/gi, "")
			.replace(/<style[\s\S]*?<\/style>/gi, "")
			.replace(/\sstyle=(["']).*?\1/gi, "")
			.replace(/\son\w+=(["']).*?\1/gi, ""),
	);
}

export function sanitizeHtml(html: string) {
	if (!browser) {
		return serverSanitizeHtml(html);
	}

	const sanitized = DOMPurify.sanitize(html, {
		USE_PROFILES: { html: true },
		FORBID_TAGS: ["svg", "math"],
		FORBID_ATTR: ["style", "on*"],
	});

	return cleanupGeoHtml(sanitized);
}

export function sanitizeText(text: string) {
	if (!browser) {
		return serverSanitizeHtml(text).replace(/<[^>]*>/g, "").trim();
	}

	return DOMPurify.sanitize(text, {
		ALLOWED_TAGS: [],
		ALLOWED_ATTR: [],
	}).trim();
}

export function escapeHtml(text: string) {
	return he.escape(text);
}
