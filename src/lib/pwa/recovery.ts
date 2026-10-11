export const APP_CACHE_PREFIX = 'rnt-cache-';
export const RECOVERY_QUERY_PARAM = 'appUpdate';
export const RECOVERY_REASON_PARAM = 'recoveryReason';

type CacheStorageLike = {
	keys(): Promise<string[]>;
	delete(cacheName: string): Promise<boolean>;
};

type ServiceWorkerRegistrationLike = {
	unregister(): Promise<boolean>;
};

type ServiceWorkerContainerLike = {
	getRegistrations(): Promise<ServiceWorkerRegistrationLike[]>;
};

export type AppRecoveryResult = {
	unregisteredServiceWorkers: number;
	deletedCaches: string[];
};

export function getAppCacheNames(cacheNames: string[], prefix = APP_CACHE_PREFIX): string[] {
	return cacheNames.filter((name) => name.startsWith(prefix));
}

export async function deleteAppCaches(
	cacheStorage: CacheStorageLike,
	prefix = APP_CACHE_PREFIX,
): Promise<string[]> {
	const cacheNames = await cacheStorage.keys();
	const appCacheNames = getAppCacheNames(cacheNames, prefix);

	await Promise.all(appCacheNames.map((name) => cacheStorage.delete(name)));
	return appCacheNames;
}

export async function unregisterServiceWorkers(
	serviceWorker: ServiceWorkerContainerLike,
): Promise<number> {
	const registrations = await serviceWorker.getRegistrations();
	await Promise.all(registrations.map((registration) => registration.unregister()));
	return registrations.length;
}

export function buildRecoveryUrl(
	href: string,
	marker: string | number = Date.now(),
	reason = 'manual',
): string {
	const url = new URL(href);
	url.searchParams.set(RECOVERY_QUERY_PARAM, String(marker));
	url.searchParams.set(RECOVERY_REASON_PARAM, reason);
	return url.toString();
}

export async function recoverAppShell({
	serviceWorker,
	cacheStorage,
	cachePrefix = APP_CACHE_PREFIX,
}: {
	serviceWorker?: ServiceWorkerContainerLike | null;
	cacheStorage?: CacheStorageLike | null;
	cachePrefix?: string;
}): Promise<AppRecoveryResult> {
	const [unregisteredServiceWorkers, deletedCaches] = await Promise.all([
		serviceWorker ? unregisterServiceWorkers(serviceWorker) : Promise.resolve(0),
		cacheStorage ? deleteAppCaches(cacheStorage, cachePrefix) : Promise.resolve([]),
	]);

	return {
		unregisteredServiceWorkers,
		deletedCaches,
	};
}
