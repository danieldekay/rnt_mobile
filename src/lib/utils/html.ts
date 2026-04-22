import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string) {
	return DOMPurify.sanitize(html, {
		USE_PROFILES: { html: true }
	});
}

export function sanitizeText(text: string) {
	return DOMPurify.sanitize(text, {
		ALLOWED_TAGS: [],
		ALLOWED_ATTR: []
	}).trim();
}

export function escapeHtml(text: string) {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}