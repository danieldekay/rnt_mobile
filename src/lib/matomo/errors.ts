/**
 * Matomo error tracking — JavaScript errors, promise rejections.
 */

import { browser } from '$app/environment';
import { getQueue, ensureMatomo, offlineMode, currentDisplayMode, addPendingEvent } from './tracking';

const ERROR_SESSION_LIMIT = 10;

let errorListener: ((event: ErrorEvent) => void) | null = null;
let rejectionListener: ((event: PromiseRejectionEvent) => void) | null = null;
let trackedErrorsThisSession = 0;

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
	const command: [string, ...unknown[]] = ['trackEvent', 'errors', category, label];

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
