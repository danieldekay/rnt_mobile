/**
 * Matomo performance tracking — LCP, CLS, FID.
 */

import { browser } from '$app/environment';
import { getQueue, ensureMatomo, currentDisplayMode, addPendingEvent } from './tracking';

interface PerfMetrics {
	lcp: number | null;
	cls: number | null;
	fid: number | null;
}

interface LayoutShiftEntry extends PerformanceEntry {
	hadRecentInput: boolean;
	value: number;
}

interface FirstInputEntry extends PerformanceEntry {
	processingStart: number;
	startTime: number;
}

let perfMetrics: PerfMetrics = { lcp: null, cls: null, fid: null };
let _lcpObs: PerformanceObserver | null = null;
let _clsObs: PerformanceObserver | null = null;
let _fidObs: PerformanceObserver | null = null;

export function setupPerformanceTracking(): void {
	if (!browser) return;
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
		queue.push(['trackEvent', 'performance', 'fid', `${Math.round(perfMetrics.fid)}ms@${currentDisplayMode}`]);
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

export function teardownPerformanceTracking(): void {
	if (_lcpObs) { _lcpObs.disconnect(); _lcpObs = null; }
	if (_clsObs) { _clsObs.disconnect(); _clsObs = null; }
	if (_fidObs) { _fidObs.disconnect(); _fidObs = null; }
	perfMetrics = { lcp: null, cls: null, fid: null };
}
