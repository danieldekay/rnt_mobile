import { browser } from '$app/environment';

type UpdateCheckState = 'idle' | 'checking' | 'current' | 'available' | 'error';

function createPwaUpdateStore() {
	let hasUpdate = $state(false);
	let checking = $state(false);
	let checkState = $state<UpdateCheckState>('idle');
	let checkError = $state<string | null>(null);
	let lastCheckedAt = $state<string | null>(null);
	let recoveryOpen = $state(false);

	function syncFromKit(current: boolean) {
		hasUpdate = current;

		if (current) {
			checkState = 'available';
			checkError = null;
		}
	}

	async function checkForUpdate(check: () => Promise<boolean>) {
		if (!browser || checking) return false;

		checking = true;
		checkState = 'checking';
		checkError = null;
		lastCheckedAt = new Date().toISOString();

		try {
			const available = await check();
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

	function applyUpdate() {
		if (!browser) return;
		window.location.reload();
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
		syncFromKit,
		checkForUpdate,
		applyUpdate,
		toggleRecovery,
		closeRecovery
	};
}

export const pwaUpdateStore = createPwaUpdateStore();