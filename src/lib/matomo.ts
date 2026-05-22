/**
 * Matomo analytics — backward-compatible re-export layer.
 * All public exports are re-delegated to the split modules below.
 */

export {
	syncMatomoConsent,
	trackPageView,
	trackFeatureEvent,
	matomoConfigured,
	getMatomoDisplayMode,
	cleanup,
} from './matomo/tracking';

export {
	trackError,
	setupErrorTracking,
	teardownErrorTracking,
} from './matomo/errors';

export {
	setupPerformanceTracking,
	trackPerformance,
	sendPerformanceMetrics,
	teardownPerformanceTracking,
} from './matomo/performance';
