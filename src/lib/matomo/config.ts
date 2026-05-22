/**
 * Matomo analytics configuration.
 * Exports config helpers used by all matomo sub-modules.
 */

import { env } from '$env/dynamic/public';

export function normalizeBaseUrl(value: string | undefined): string | null {
	if (!value) return null;
	const normalized = value.trim().replace(/\/$/, '');
	return normalized.length > 0 ? normalized : null;
}

export interface MatomoConfig {
	baseUrl: string;
	siteId: string;
}

export function getConfig(): MatomoConfig | null {
	const baseUrl = normalizeBaseUrl(env.PUBLIC_MATOMO_URL);
	const siteId = env.PUBLIC_MATOMO_SITE_ID?.trim();

	if (!baseUrl || !siteId) {
		return null;
	}

	return { baseUrl, siteId };
}
