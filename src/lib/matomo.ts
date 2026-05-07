import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

declare const __APP_VERSION__: string;

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
const ERROR_SESSION_LIMIT = 10;

type DisplayMode = 'standalone' | 'minimal-ui' | 'fullscreen' | 'browser';

interface LayoutShiftEntry extends PerformanceEntry {
	hadRecentInput: boolean;
	value: number;
}

interface FirstInputEntry extends PerformanceEntry {
	processingStart: number;
	startTime: number;
}

let initialized = false;
let scriptInjected = false;
let analyticsEnabled = false;
let lastTrackedUrl = '';
let offlineMode = false;
let onlineListener: (() => void) | null = null;
let displayModeListeners: Array<() => void> = [];
let currentDisplayMode: DisplayMode = 'browser';
let errorListener: ((event: ErrorEvent) => void) | null = null;
let rejectionListener: ((event: PromiseRejectionEvent) => void) | null = null;
let trackedErrorsThisSession = 0;

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

function watchDisplayMode() {
	if (!browser || displayModeListeners.length > 0) return;

	const modes: DisplayMode[] = ['standalone', 'minimal-ui', 'fullscreen'];
	for (const mode of modes) {
		const mql = window.matchMedia(`(display-mode: ${mode})`);
		const handler = () => {
			const next = detectDisplayMode();
			if (next !== currentDisplayMode) {
				currentDisplayMode = next;
				pushDisplayModeDimension();
			}
		};
		mql.addEventListener('change', handler);
		displayModeListeners.push(() => mql.removeEventListener('change', handler));
	}
}

function unwatchDisplayMode() {
	for (const off of displayModeListeners) off();
	displayModeListeners = [];
}

function pushDisplayModeDimension() {
	const queue = getQueue();
	if (!queue) return;
	queue.push(['setCustomDimension', 1, currentDisplayMode]);
	queue.push(['setCustomVariable', 1, 'display_mode', currentDisplayMode, 'visit']);
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

function addPendingEvent(command: MatomoCommand) {
	if (!browser) return;
	const events = getPendingEvents();
	events.push({ timestamp: Date.now(), command });
	setPendingEvents(events);
}

function clearPendingEvents() {
	if (!browser) return;
	try {
		localStorage.removeItem(PENDING_EVENTS_KEY);
	} catch {
		/* empty */
	}
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

function setupOnlineListener() {
	if (!browser || onlineListener) return;

	onlineListener = () => {
		offlineMode = false;
		retrySendPendingEvents();
	};

	window.addEventListener('online', onlineListener);
}

function teardownOnlineListener() {
	if (!browser || !onlineListener) return;
	window.removeEventListener('online', onlineListener);
	onlineListener = null;
}

function retrySendPendingEvents() {
	if (!analyticsEnabled || !initialized || !isOnline()) return;

	const events = getPendingEvents();
	if (events.length === 0) return;

	const queue = getQueue();
	if (!queue) return;

	for (const event of events) {
		queue.push(event.command);
	}
	clearPendingEvents();

	// Matomo's async queue normally flushes on the next trackPageView / trackEvent call.
	// When we re-queue after offline, no such call is pending, so we ask the tracker to
	// flush immediately. `sendRequests` is the supported method on the tracker object
	// (NOT on the `_paq` array — that was the previous bug).
	const tracker = getTracker();
	tracker?.sendRequests?.();
}

function ensureMatomo(): boolean {
	if (!analyticsEnabled) return false;

	const config = getConfig();
	const queue = getQueue();
	if (!config || !queue) return false;

	if (!initialized) {
		currentDisplayMode = detectDisplayMode();

		queue.push(['disableCookies']);
		queue.push(['setTrackerUrl', `${config.baseUrl}/matomo.php`]);
		queue.push(['setSiteId', config.siteId]);

		// Keep time-on-page meaningful in standalone/installed PWAs, where sessions are
		// long-lived and navigation is SPA-style. Matomo's default would otherwise report
		// zero duration for single-page visits.
		queue.push(['enableHeartBeatTimer', 30]);

		// Use sendBeacon so the final event in a visit still reaches Matomo when the PWA
		// is backgrounded or the app window is closed — browsers cancel regular XHRs on
		// unload, which is the common case for installed PWAs.
		queue.push(['alwaysUseSendBeacon']);

		queue.push(['enableLinkTracking']);

		pushDisplayModeDimension();

		initialized = true;

		setupOnlineListener();
		watchDisplayMode();
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

export function syncMatomoConsent(enabled: boolean, url?: string, title?: string) {
	analyticsEnabled = enabled;

	if (!enabled) {
		lastTrackedUrl = '';
		teardownOnlineListener();
		unwatchDisplayMode();
		teardownErrorTracking();
		teardownPerformanceTracking();
		return false;
	}

	if (!ensureMatomo()) {
		return false;
	}

	setupErrorTracking();
	setupPerformanceTracking();

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
	teardownOnlineListener();
	unwatchDisplayMode();
	analyticsEnabled = false;
	initialized = false;
	scriptInjected = false;
	teardownErrorTracking();
	teardownPerformanceTracking();
}

// ─── Error Tracking ───────────────────────────────────────────────

export function trackError(
	category: 'js-error' | 'fetch-error' | 'promise-rejection' | 'component-error',
	message: string,
	detail?: Record<string, string>
): void {
	const queue = getQueue();
	if (!ensureMatomo() || !queue) return;
	if (trackedErrorsThisSession >= ERROR_SESSION_LIMIT) return;

	const detailStr = detail
		? Object.entries(detail)
				.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
				.join('|')
		: '';
	const url = browser ? `${window.location.pathname}${window.location.search}` : '';
	const label = [
		`message=${encodeURIComponent(message.slice(0, 160))}`,
		`mode=${currentDisplayMode}`,
		`url=${encodeURIComponent(url)}`,
		detailStr
	]
		.filter(Boolean)
		.join('|');
	const command: MatomoCommand = ['trackEvent', 'errors', category, label];

	queue.push(command);
	queue.push(['setCustomDimension', 2, `${category}:${message.slice(0, 100)}`]);
	trackedErrorsThisSession += 1;

	if (offlineMode) addPendingEvent(command);
}

export function setupErrorTracking(): void {
	if (!browser || errorListener || rejectionListener) return;

	errorListener = (event: ErrorEvent) => {
		const message = event.message ?? 'unknown error';
		trackError('js-error', message, {
			filename: event.filename ?? '',
			lineno: String(event.lineno ?? 0),
			colno: String(event.colno ?? 0)
		});
	};

	rejectionListener = (event: PromiseRejectionEvent) => {
		const message = (event.reason?.message ?? String(event.reason))?.slice(0, 500) ?? 'unhandled rejection';
		trackError('promise-rejection', message, {
			type: String((event.reason as any)?.constructor?.name ?? 'unknown')
		});
	};

	window.addEventListener('error', errorListener);
	window.addEventListener('unhandledrejection', rejectionListener);
}

// ─── Performance Tracking ─────────────────────────────────────────

interface PerfMetrics {
	lcp: number | null;
	cls: number | null;
	fid: number | null;
}

let perfMetrics: PerfMetrics = { lcp: null, cls: null, fid: null };
let _lcpObs: PerformanceObserver | null = null;
let _clsObs: PerformanceObserver | null = null;
let _fidObs: PerformanceObserver | null = null;


export function setupPerformanceTracking(): void {
	if (!browser || !analyticsEnabled) return;
	if (_lcpObs || _clsObs || _fidObs) return;

	if ('PerformanceObserver' in window) {
		try {
			_lcpObs = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				if (entries.length > 0) {
					perfMetrics.lcp = entries[entries.length - 1].startTime;
					sendPerformanceMetrics();
				}
			});
			_lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
		} catch {
			// silently fail
		}
	}

	if ('PerformanceObserver' in window) {
		try {
			_fidObs = new PerformanceObserver((list) => {
				const entries = list.getEntries() as FirstInputEntry[];
				if (entries.length > 0) {
					const entry = entries[0];
					perfMetrics.fid = entry.processingStart - entry.startTime;
					sendPerformanceMetrics();
				}
			});
			_fidObs.observe({ type: 'first-input', buffered: true });
		} catch {
			// silently fail
		}
	}

	if ('PerformanceObserver' in window) {
		try {
			_clsObs = new PerformanceObserver((list) => {
				let clsValue = 0;
				for (const entry of list.getEntries() as LayoutShiftEntry[]) {
					if (!entry.hadRecentInput) clsValue += entry.value;
				}
				perfMetrics.cls = clsValue;
				sendPerformanceMetrics();
			});
			_clsObs.observe({ type: 'layout-shift', buffered: true });
		} catch {
			// silently fail
		}
	}
}

export function trackPerformance(): void {
	setupPerformanceTracking();
}

export function sendPerformanceMetrics(): void {
	const queue = getQueue();
	if (!ensureMatomo() || !queue) return;

	if (perfMetrics.lcp !== null) {
		queue.push(['trackEvent', 'performance', 'lcp', `${Math.round(perfMetrics.lcp)}ms@${__APP_VERSION__}:${currentDisplayMode}`]);
	}

	if (perfMetrics.fid !== null) {
		queue.push(['trackEvent', 'performance', 'fid', `${Math.round(perfMetrics.fid)}ms@${__APP_VERSION__}:${currentDisplayMode}`]);
	}

	if (perfMetrics.cls !== null) {
		queue.push(['trackEvent', 'performance', 'cls', `${perfMetrics.cls.toFixed(3)}@${__APP_VERSION__}:${currentDisplayMode}`]);
	}

	if (perfMetrics.lcp !== null && perfMetrics.fid !== null && perfMetrics.cls !== null) {
		queue.push([
			'trackEvent',
			'performance',
			'all',
			`lcp=${Math.round(perfMetrics.lcp)}|fid=${Math.round(perfMetrics.fid)}|cls=${perfMetrics.cls.toFixed(3)}@${__APP_VERSION__}:${currentDisplayMode}`
		]);
	}
}

export function teardownErrorTracking(): void {
	if (!browser) return;
	if (errorListener) {
		window.removeEventListener('error', errorListener);
		errorListener = null;
	}
	if (rejectionListener) {
		window.removeEventListener('unhandledrejection', rejectionListener);
		rejectionListener = null;
	}
}

export function teardownPerformanceTracking(): void {
	if (_lcpObs) { _lcpObs.disconnect(); _lcpObs = null; }
	if (_clsObs) { _clsObs.disconnect(); _clsObs = null; }
	if (_fidObs) { _fidObs.disconnect(); _fidObs = null; }
	perfMetrics = { lcp: null, cls: null, fid: null };
}
