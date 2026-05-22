/**
 * Matomo tracking — page views and feature events.
 * Depends on config for baseUrl/siteId and offline for pending events.
 */

import { browser } from '$app/environment';
import { getConfig } from './config';

type MatomoCommand = [string, ...unknown[]];

interface PendingTrackingEvent {
	timestamp: number;
	command: MatomoCommand;
}

interface MatomoTracker {
	sendRequests?: () => void;
	ping?: () => void;
	setCustomDimension?: (id: number, value: string) => void;
}

interface MatomoGlobal {
	getAsyncTracker?: () => MatomoTracker | undefined;
}

declare global {
	interface Window {
		_paq?: MatomoCommand[];
		Matomo?: MatomoGlobal;
	}
}

const PENDING_EVENTS_KEY = 'matomo-pending-events';
const MAX_PENDING_EVENTS = 50;

declare const __APP_VERSION__: string;

  export type DisplayMode = 'standalone' | 'minimal-ui' | 'fullscreen' | 'browser';

export let analyticsEnabled = false;
export let initialized = false;
export let scriptInjected = false;
export let lastTrackedUrl = '';
export let offlineMode = false;
export let currentDisplayMode: DisplayMode = 'browser';

export function getQueue(): MatomoCommand[] | null {
	if (!browser) return null;
	window._paq ??= [];
	return window._paq;
}

function getTracker(): MatomoTracker | null {
	if (!browser) return null;
	const tracker = window.Matomo?.getAsyncTracker?.();
	return tracker ?? null;
}

function detectDisplayMode(): DisplayMode {
	if (!browser) return 'browser';

	const iosStandalone =
		typeof (navigator as { standalone?: boolean }).standalone === 'boolean' &&
		(navigator as { standalone?: boolean }).standalone === true;
	if (iosStandalone) return 'standalone';

	const modes: DisplayMode[] = ['standalone', 'minimal-ui', 'fullscreen'];
	for (const mode of modes) {
		if (window.matchMedia(`(display-mode: ${mode})`).matches) {
			return mode;
		}
	}
	return 'browser';
}

function getPendingEvents(): PendingTrackingEvent[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(PENDING_EVENTS_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function setPendingEvents(events: PendingTrackingEvent[]) {
	if (!browser) return;
	try {
		const truncated = events.slice(-MAX_PENDING_EVENTS);
		localStorage.setItem(PENDING_EVENTS_KEY, JSON.stringify(truncated));
	} catch {
		/* empty */
	}
}

export function addPendingEvent(command: MatomoCommand) {
	if (!browser) return;
	const events = getPendingEvents();
	events.push({ timestamp: Date.now(), command });
	setPendingEvents(events);
}

function getFeatureContext(pathname: string): string {
	if (pathname === '/') return 'home';
	if (pathname.startsWith('/kalender')) return 'calendar';
	if (pathname.startsWith('/event/')) return 'event-detail';
	if (pathname.startsWith('/impressum')) return 'legal-impressum';
	if (pathname.startsWith('/datenschutz')) return 'legal-datenschutz';
	if (pathname.startsWith('/cookie-richtlinie')) return 'legal-cookie-richtlinie';
	if (pathname.startsWith('/was-ist-neu')) return 'app-release-notes';
	return 'app';
}

function isOnline(): boolean {
	if (!browser) return true;
	return navigator.onLine;
}

export function ensureMatomo(): boolean {
	if (!analyticsEnabled) return false;

	const config = getConfig();
	const queue = getQueue();
	if (!config || !queue) return false;

	if (!initialized) {
		currentDisplayMode = detectDisplayMode();

		queue.push(['disableCookies']);
		queue.push(['setTrackerUrl', `${config.baseUrl}/matomo.php`]);
		queue.push(['setSiteId', config.siteId]);
		queue.push(['enableHeartBeatTimer', 30]);
		queue.push(['alwaysUseSendBeacon']);
		queue.push(['enableLinkTracking']);
		queue.push(['setCustomDimension', 1, currentDisplayMode]);
		queue.push(['setCustomVariable', 1, 'display_mode', currentDisplayMode, 'visit']);

		initialized = true;
		offlineMode = !isOnline();
	}

	if (!scriptInjected) {
		const script = document.createElement('script');
		script.async = true;
		script.src = `${config.baseUrl}/matomo.js`;
		script.onerror = () => {
			offlineMode = true;
		};
		document.head.appendChild(script);
		scriptInjected = true;
	}

	return true;
}

// Public exports

export function syncMatomoConsent(enabled: boolean, url?: string, title?: string) {
	analyticsEnabled = enabled;

	if (!enabled) {
		lastTrackedUrl = '';
		initialized = false;
		scriptInjected = false;
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

	const commands: MatomoCommand[] = [
		['setCustomUrl', url],
		['setDocumentTitle', title],
		['setCustomDimension', 1, currentDisplayMode],
		['trackPageView'],
		['trackEvent', 'app', 'route_view', `${feature}@${__APP_VERSION__}:${currentDisplayMode}`]
	];

	for (const command of commands) {
		queue.push(command);
		if (offlineMode) {
			addPendingEvent(command);
		}
	}
}

export function trackFeatureEvent(feature: string, action: string, detail?: string) {
	const queue = getQueue();
	if (!ensureMatomo() || !queue) return;

	const suffix = detail ? `${detail}@${__APP_VERSION__}` : __APP_VERSION__;
	const command: MatomoCommand = [
		'trackEvent',
		feature,
		action,
		`${suffix}:${currentDisplayMode}`
	];

	queue.push(command);
	if (offlineMode) {
		addPendingEvent(command);
	}
}

export function matomoConfigured() {
	return getConfig() !== null;
}

export function getMatomoDisplayMode(): DisplayMode {
	return currentDisplayMode;
}

export function cleanup() {
	analyticsEnabled = false;
	initialized = false;
	scriptInjected = false;
	lastTrackedUrl = '';
}
