import { sanitizeHtml, sanitizeText } from '$lib/utils/html';

const WORDPRESS_PAGES_ENDPOINT = 'https://www.rhein-neckar-tango.de/wp-json/wp/v2/pages';

export const LEGAL_PAGE_CONFIG = {
	impressum: {
		wpSlug: 'impressum',
		canonicalUrl: 'https://www.rhein-neckar-tango.de/impressum/'
	},
	datenschutz: {
		wpSlug: 'datenschutz',
		canonicalUrl: 'https://www.rhein-neckar-tango.de/datenschutz/'
	},
	'cookie-richtlinie': {
		wpSlug: 'cookie-richtlinie-eu',
		canonicalUrl: 'https://www.rhein-neckar-tango.de/cookie-richtlinie-eu/'
	}
} as const;

export type LegalPageKey = keyof typeof LEGAL_PAGE_CONFIG;

interface WordPressRenderedField {
	rendered: string;
}

interface WordPressLegalPage {
	slug: string;
	link: string;
	modified: string;
	title: WordPressRenderedField;
	content: WordPressRenderedField;
}

export interface LegalDocumentPage {
	key: LegalPageKey;
	title: string;
	content: string;
	canonicalUrl: string;
	modified: string | null;
	sourceSlug: string;
}

export async function fetchLegalPage(key: LegalPageKey): Promise<LegalDocumentPage> {
	const config = LEGAL_PAGE_CONFIG[key];
	const params = new URLSearchParams({
		slug: config.wpSlug,
		_fields: 'slug,link,modified,title,content'
	});

	const response = await fetch(`${WORDPRESS_PAGES_ENDPOINT}?${params.toString()}`);
	if (!response.ok) {
		throw new Error('Die Rechtsseite konnte nicht geladen werden.');
	}

	const pages = (await response.json()) as WordPressLegalPage[];
	const page = pages[0];

	if (!page) {
		throw new Error('Die Rechtsseite ist derzeit nicht verfuegbar.');
	}

	return {
		key,
		title: sanitizeText(page.title.rendered) || key,
		content: sanitizeHtml(page.content.rendered),
		canonicalUrl: page.link || config.canonicalUrl,
		modified: page.modified || null,
		sourceSlug: page.slug
	};
}