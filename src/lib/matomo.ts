import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

declare const __APP_VERSION__: string;

type MatomoCommand = [string, ...unknown[]];

declare global {
	interface Window {
		_paq?: MatomoCommand[];
	}
}

let initialized = false;
let scriptInjected = false;
let analyticsEnabled = false;
let lastTrackedUrl = '';

function normalizeBaseUrl(value: string | undefined): string | null {
	if (!value) return null;
	const normalized = value.trim().replace(/\/$/, '');
	return normalized.length > 0 ? normalized : null;
}

function getConfig() {
	const baseUrl = normalizeBaseUrl(env.PUBLIC_MATOMO_URL);
	const siteId = env.PUBLIC_MATOMO_SITE_ID?.trim();

	if (!baseUrl || !siteId) {
		return null;
	}

	return { baseUrl, siteId };
}

function getQueue(): MatomoCommand[] | null {
	if (!browser) return null;
	window._paq ??= [];
	return window._paq;
}

function getFeatureContext(pathname: string): string {
	if (pathname === '/') return 'home';
	if (pathname.startsWith('/calendar')) return 'calendar';
	if (pathname.startsWith('/event/')) return 'event-detail';
	if (pathname.startsWith('/impressum')) return 'legal-impressum';
	if (pathname.startsWith('/datenschutz')) return 'legal-datenschutz';
	if (pathname.startsWith('/cookie-richtlinie')) return 'legal-cookie-richtlinie';
	return 'app';
}

function ensureMatomo(): boolean {
	if (!analyticsEnabled) return false;

	const config = getConfig();
	const queue = getQueue();
	if (!config || !queue) return false;

	if (!initialized) {
		queue.push(['disableCookies']);
		queue.push(['setTrackerUrl', `${config.baseUrl}/matomo.php`]);
		queue.push(['setSiteId', config.siteId]);
		initialized = true;
	}

	if (!scriptInjected) {
		const script = document.createElement('script');
		script.async = true;
		script.src = `${config.baseUrl}/matomo.js`;
		document.head.appendChild(script);
		scriptInjected = true;
	}

	return true;
}

export function syncMatomoConsent(enabled: boolean, url?: string, title?: string) {
	analyticsEnabled = enabled;

	if (!enabled) {
		lastTrackedUrl = '';
		return false;
	}

	if (!ensureMatomo()) {
		return false;
	}

	if (url) {
		trackPageView(url, title);
	}

	return true;
}

export function trackPageView(url: string, title = document.title) {
	const queue = getQueue();
	if (!ensureMatomo() || !queue) return;

	if (lastTrackedUrl === url) {
		return;
	}

	lastTrackedUrl = url;
	const pathname = url.split('?')[0] ?? url;
	const feature = getFeatureContext(pathname);

	queue.push(['setCustomUrl', url]);
	queue.push(['setDocumentTitle', title]);
	queue.push(['trackPageView']);
	queue.push(['trackEvent', 'app', 'route_view', `${feature}@${__APP_VERSION__}`]);
}

export function trackFeatureEvent(feature: string, action: string, detail?: string) {
	const queue = getQueue();
	if (!ensureMatomo() || !queue) return;

	queue.push(['trackEvent', feature, action, detail ? `${detail}@${__APP_VERSION__}` : __APP_VERSION__]);
}

export function matomoConfigured() {
	return getConfig() !== null;
}