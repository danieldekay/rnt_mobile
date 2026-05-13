const HTML_ENTITY_MAP: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
	ndash: '–',
	mdash: '—',
	hellip: '…',
	rsquo: '’',
	lsquo: '‘',
	rdquo: '”',
	ldquo: '“',
	laquo: '«',
	raquo: '»',
	deg: '°',
	euro: '€',
	copy: '©',
	reg: '®',
	trade: '™',
	uml: '¨',
	auml: 'ä',
	ouml: 'ö',
	uuml: 'ü',
	Auml: 'Ä',
	Ouml: 'Ö',
	Uuml: 'Ü',
	szlig: 'ß'
};

/**
 * Decodes HTML entities in a string, supporting both named entities and numeric/hex code points.
 */
export function decodeHtmlEntities(value: string | null | undefined): string {
	if (!value) return '';

	return value.replace(/&(#x?[\da-f]+|[a-z]+);/gi, (match, entity: string) => {
		if (entity.startsWith('#x') || entity.startsWith('#X')) {
			const codePoint = Number.parseInt(entity.slice(2), 16);
			return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
		}

		if (entity.startsWith('#')) {
			const codePoint = Number.parseInt(entity.slice(1), 10);
			return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
		}

		return HTML_ENTITY_MAP[entity] ?? match;
	});
}

/**
 * Removes HTML tags from a string and replaces block-level elements with line breaks.
 * This is intended for creating plain-text versions of HTML content.
 */
export function stripHtml(value: string | null | undefined): string {
	if (!value) return '';

	return decodeHtmlEntities(value)
		.replace(/\u00a0/g, ' ')
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/(p|div|li|h[1-6]|section|article)>/gi, '\n')
		.replace(/<[^>]+>/g, ' ')
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{2,}/g, '\n')
		.replace(/[ \t]{2,}/g, ' ')
		.trim();
}

/**
 * Normalizes text by decoding entities and collapsing all whitespace into single spaces.
 */
export function normalizeText(value: string | null | undefined): string {
	if (!value) return '';

	return decodeHtmlEntities(value)
		.replace(/\u00a0/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Truncates a string to a maximum length, appending an ellipsis if it was cut.
 */
export function truncate(value: string | null | undefined, maxLength: number): string {
	if (!value) return '';
	if (value.length <= maxLength) return value;
	return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}
