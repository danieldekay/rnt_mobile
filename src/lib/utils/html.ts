import DOMPurify from "dompurify";
import he from "he";

export function sanitizeHtml(html: string) {
	return DOMPurify.sanitize(html, {
		USE_PROFILES: { html: true },
		FORBID_TAGS: ["svg", "math"],
		FORBID_ATTR: ["on*"],
	});
}

export function sanitizeText(text: string) {
	return DOMPurify.sanitize(text, {
		ALLOWED_TAGS: [],
		ALLOWED_ATTR: [],
	}).trim();
}

export function escapeHtml(text: string) {
	return he.escape(text);
}
