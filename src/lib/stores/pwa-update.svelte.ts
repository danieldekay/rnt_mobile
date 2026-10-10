import { browser } from '$app/environment';

type UpdateCheckState = 'idle' | 'checking' | 'current' | 'available' | 'error';

type UpdateMessage = {
	type?: string;
	version?: string;
};

const UPDATE_CHECK_INTERVAL_MS = 15 * 60 * 1000;
const FORCE_RELOAD_DELAY_MS = 1500;
const APP_CACHE_PREFIX = 'rnt-cache-';
const ACTIVATED_MESSAGE_TYPE = 'RNT_SW_ACTIVATED';

function createPwaUpdateStore() {
	let hasUpdate = $state(false);
	let checking = $state(false);
	let checkState = $state<UpdateCheckState>('idle');
	let checkError = $state<string | null>(null);
	let lastCheckedAt = $state<string | null>(null);
	let recoveryOpen = $state(false);

	let started = false;
	let applyInProgress = false;
	let reloadStarted = false;
	let registration: ServiceWorkerRegistration | null = null;
	let updateInterval: ReturnType<typeof setInterval> | null = null;
	let checkForKitUpdate: (() => Promise<boolean>) | null = null;
	let hadControllerAtStart = false;

	function markAvailable() {
		hasUpdate = true;
		checkState = 'available';
		checkError = null;
		recoveryOpen = true;
	}

	function syncFromKit(current: boolean) {
		if (current) {
			markAvailable();
		}
	}

	function watchInstalling(worker: ServiceWorker | null) {
		if (!worker) return;

		worker.addEventListener('statechange', () => {
			if (worker.state === 'installed' && navigator.serviceWorker.controller) {
				markAvailable();
			}
		});
	}

	function watchRegistration(nextRegistration: ServiceWorkerRegistration) {
		registration = nextRegistration;

		if (nextRegistration.waiting && navigator.serviceWorker.controller) {
			markAvailable();
		}

		watchInstalling(nextRegistration.installing);
		nextRegistration.addEventListener('updatefound', () => {
			watchInstalling(nextRegistration.installing);
		});
	}

	function reloadWithBust() {
		if (reloadStarted) return;
		reloadStarted = true;
		const url = new URL(window.location.href);
		url.searchParams.set('appUpdate', String(Date.now()));
		window.location.replace(url.toString());
	}

	async function deleteAppCaches() {
		if (!('caches' in window)) return;

		const names = await caches.keys();
		await Promise.all(
			names
				.filter((name) => name.startsWith(APP_CACHE_PREFIX))
				.map((name) => caches.delete(name))
		);
	}

	async function forceFreshInstall() {
		try {
			const registrations = await navigator.serviceWorker.getRegistrations();
			await Promise.all(registrations.map((entry) => entry.unregister()));
			await deleteAppCaches();
		} finally {
			reloadWithBust();
		}
	}

	async function probeUpdate() {
		if (!browser || checking) return false;

		checking = true;
		checkState = 'checking';
		checkError = null;
		lastCheckedAt = new Date().toISOString();

		try {
			const kitAvailable = checkForKitUpdate ? await checkForKitUpdate() : false;
			const nextRegistration =
				registration ?? (await navigator.serviceWorker.getRegistration());
			if (nextRegistration) {
				watchRegistration(nextRegistration);
				await nextRegistration.update();
			}

			const available =
				kitAvailable ||
				Boolean(nextRegistration?.waiting && navigator.serviceWorker.controller) ||
				hasUpdate;
			hasUpdate = available;
			checkState = available ? 'available' : 'current';

			if (available) {
				recoveryOpen = true;
			}

			return available;
		} catch (error) {
			checkState = 'error';
			checkError =
				error instanceof Error
					? error.message
					: 'Die Update-Prüfung konnte gerade nicht abgeschlossen werden.';
			return false;
		} finally {
			checking = false;
		}
	}

	async function checkForUpdate(check: () => Promise<boolean>) {
		checkForKitUpdate = check;
		return probeUpdate();
	}

	async function applyUpdate() {
		if (!browser) return;

		applyInProgress = true;
		checkError = null;

		try {
			const registrations = await navigator.serviceWorker.getRegistrations();
			const waitingWorkers = registrations
				.map((entry) => entry.waiting)
				.filter((worker): worker is ServiceWorker => worker !== null);

			if (waitingWorkers.length > 0) {
				for (const worker of waitingWorkers) {
					worker.postMessage({ type: 'SKIP_WAITING' });
				}
				setTimeout(() => {
					if (!reloadStarted) {
						void forceFreshInstall();
					}
				}, FORCE_RELOAD_DELAY_MS);
				return;
			}

			await forceFreshInstall();
		} catch {
			reloadWithBust();
		}
	}

	function handleControllerChange() {
		if (!browser || reloadStarted) return;

		if (applyInProgress || hadControllerAtStart) {
			reloadWithBust();
			return;
		}

		markAvailable();
	}

	function handleMessage(event: MessageEvent<UpdateMessage>) {
		if (event.data?.type !== ACTIVATED_MESSAGE_TYPE) return;

		if (applyInProgress) {
			reloadWithBust();
			return;
		}

		markAvailable();
	}

	function handleVisibilityChange() {
		if (document.visibilityState === 'visible') {
			void probeUpdate();
		}
	}

	async function start(check?: () => Promise<boolean>) {
		if (!browser || started || !('serviceWorker' in navigator)) return;

		started = true;
		checkForKitUpdate = check ?? null;
		hadControllerAtStart = Boolean(navigator.serviceWorker.controller);

		navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
		navigator.serviceWorker.addEventListener('message', handleMessage);
		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('focus', () => void probeUpdate());

		const nextRegistration = await navigator.serviceWorker.getRegistration();
		if (nextRegistration) {
			watchRegistration(nextRegistration);
			void nextRegistration.update();
		}

		updateInterval = setInterval(() => {
			void probeUpdate();
		}, UPDATE_CHECK_INTERVAL_MS);
	}

	function stop() {
		if (!browser || !started) return;

		started = false;
		if (updateInterval) {
			clearInterval(updateInterval);
			updateInterval = null;
		}

		navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
		navigator.serviceWorker.removeEventListener('message', handleMessage);
		document.removeEventListener('visibilitychange', handleVisibilityChange);
	}

	function toggleRecovery() {
		recoveryOpen = !recoveryOpen;
	}

	function closeRecovery() {
		recoveryOpen = false;
	}

	function formatLastCheckedAt() {
		if (!lastCheckedAt) return null;

		return new Date(lastCheckedAt).toLocaleTimeString('de-DE', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	return {
		get hasUpdate() {
			return hasUpdate;
		},
		get checking() {
			return checking;
		},
		get checkState() {
			return checkState;
		},
		get checkError() {
			return checkError;
		},
		get recoveryOpen() {
			return recoveryOpen;
		},
		get statusText() {
			if (checking) {
				return 'Prüfe auf Updates…';
			}

			if (checkState === 'available') {
				return 'Neue Version bereit.';
			}

			if (checkState === 'current') {
				const time = formatLastCheckedAt();
				return time ? `Zuletzt geprüft um ${time}. App ist aktuell.` : 'App ist aktuell.';
			}

			if (checkState === 'error') {
				return 'Update-Status gerade nicht erreichbar.';
			}

			return 'Automatische Update-Prüfung ist aktiv.';
		},
		start,
		stop,
		syncFromKit,
		checkForUpdate,
		applyUpdate,
		toggleRecovery,
		closeRecovery
	};
}

export const pwaUpdateStore = createPwaUpdateStore();
