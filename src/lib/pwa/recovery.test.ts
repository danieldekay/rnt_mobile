import { describe, expect, it } from 'vitest';

import {
	APP_CACHE_PREFIX,
	buildRecoveryUrl,
	deleteAppCaches,
	getAppCacheNames,
	recoverAppShell,
	unregisterServiceWorkers,
} from './recovery';

describe('PWA recovery helpers', () => {
	it('filters app-owned cache names by prefix', () => {
		expect(getAppCacheNames(['rnt-cache-v1', 'other-cache', 'rnt-cache-assets'])).toEqual([
			'rnt-cache-v1',
			'rnt-cache-assets',
		]);
	});

	it('builds a cache-busted recovery URL without dropping existing params', () => {
		const url = buildRecoveryUrl('https://mobile.rhein-neckar-tango.de/?view=calendar', 'abc', 'test');
		const parsed = new URL(url);

		expect(parsed.searchParams.get('view')).toBe('calendar');
		expect(parsed.searchParams.get('appUpdate')).toBe('abc');
		expect(parsed.searchParams.get('recoveryReason')).toBe('test');
	});

	it('deletes only RNT caches', async () => {
		const deleted: string[] = [];
		const cacheStorage = {
			async keys() {
				return ['rnt-cache-v1', 'vendor-cache', `${APP_CACHE_PREFIX}pages`];
			},
			async delete(name: string) {
				deleted.push(name);
				return true;
			},
		};

		await expect(deleteAppCaches(cacheStorage)).resolves.toEqual([
			'rnt-cache-v1',
			'rnt-cache-pages',
		]);
		expect(deleted).toEqual(['rnt-cache-v1', 'rnt-cache-pages']);
	});

	it('unregisters all current Service Worker registrations', async () => {
		const calls: string[] = [];
		const serviceWorker = {
			async getRegistrations() {
				return [
					{
						async unregister() {
							calls.push('one');
							return true;
						},
					},
					{
						async unregister() {
							calls.push('two');
							return true;
						},
					},
				];
			},
		};

		await expect(unregisterServiceWorkers(serviceWorker)).resolves.toBe(2);
		expect(calls).toEqual(['one', 'two']);
	});

	it('recovers app shell by unregistering workers and deleting app caches', async () => {
		const result = await recoverAppShell({
			serviceWorker: {
				async getRegistrations() {
					return [
						{
							async unregister() {
								return true;
							},
						},
					];
				},
			},
			cacheStorage: {
				async keys() {
					return ['rnt-cache-v1', 'unrelated'];
				},
				async delete() {
					return true;
				},
			},
		});

		expect(result).toEqual({
			unregisteredServiceWorkers: 1,
			deletedCaches: ['rnt-cache-v1'],
		});
	});
});
