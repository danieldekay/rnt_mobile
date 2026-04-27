import { browser } from '$app/environment';

export type InstallPlatform =
	| 'chromium-prompt' // Chromium browsers where beforeinstallprompt already fired
	| 'ios-safari'
	| 'ios-other' // Firefox / Chrome on iOS cannot install; must redirect the user to Safari
	| 'android-firefox'
	| 'android-samsung'
	| 'android-generic'
	| 'desktop-safari'
	| 'desktop-firefox'
	| 'desktop-chromium'
	| 'unknown';

export type BeforeInstallPromptEvent = Event & {
	readonly platforms: string[];
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISSED_STORAGE_KEY = 'pwa-install-dismissed';

function isStandalone(): boolean {
	if (!browser) return false;
	if ((navigator as unknown as { standalone?: boolean }).standalone === true) return true;
	return window.matchMedia('(display-mode: standalone)').matches;
}

function detectPlatform(deferredAvailable: boolean): InstallPlatform {
	if (!browser) return 'unknown';

	const ua = navigator.userAgent;
	const isIOS = /iPad|iPhone|iPod/.test(ua);
	const isAndroid = /Android/.test(ua);
	const isSamsung = /SamsungBrowser/.test(ua);
	const isFirefox = /Firefox\//.test(ua) || /FxiOS/.test(ua);
	const isEdge = /Edg\//.test(ua);
	const isChrome = /Chrome\//.test(ua) && !isEdge && !isSamsung;
	const isSafari = /Safari\//.test(ua) && !isChrome && !isEdge && !isSamsung && !isFirefox;

	if (deferredAvailable) return 'chromium-prompt';

	if (isIOS) {
		if (isFirefox || /CriOS/.test(ua)) return 'ios-other';
		return 'ios-safari';
	}

	if (isAndroid) {
		if (isFirefox) return 'android-firefox';
		if (isSamsung) return 'android-samsung';
		return 'android-generic';
	}

	if (isSafari) return 'desktop-safari';
	if (isFirefox) return 'desktop-firefox';
	if (isChrome || isEdge) return 'desktop-chromium';

	return 'unknown';
}

function createPwaInstallStore() {
	let ready = $state(false);
	let standalone = $state(false);
	let deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
	let modalOpen = $state(false);
	let dismissed = $state(false);
	let promptInFlight = $state(false);
	let lastOutcome = $state<'accepted' | 'dismissed' | null>(null);

	let removeInstallListener: (() => void) | null = null;
	let removeInstalledListener: (() => void) | null = null;
	let removeStandaloneListener: (() => void) | null = null;

	const platform = $derived<InstallPlatform>(detectPlatform(deferredPrompt !== null));
	const buttonVisible = $derived(ready && !standalone);

	function handleBeforeInstallPrompt(event: Event) {
		event.preventDefault();
		deferredPrompt = event as BeforeInstallPromptEvent;
	}

	function handleAppInstalled() {
		deferredPrompt = null;
		standalone = true;
		modalOpen = false;
		lastOutcome = 'accepted';
	}

	function start() {
		if (!browser || ready) return;

		standalone = isStandalone();
		dismissed = localStorage.getItem(DISMISSED_STORAGE_KEY) === 'true';

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		removeInstallListener = () =>
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

		window.addEventListener('appinstalled', handleAppInstalled);
		removeInstalledListener = () =>
			window.removeEventListener('appinstalled', handleAppInstalled);

		const mql = window.matchMedia('(display-mode: standalone)');
		const onChange = (event: MediaQueryListEvent) => {
			standalone = event.matches;
		};
		if (typeof mql.addEventListener === 'function') {
			mql.addEventListener('change', onChange);
			removeStandaloneListener = () => mql.removeEventListener('change', onChange);
		}

		ready = true;
	}

	function stop() {
		removeInstallListener?.();
		removeInstalledListener?.();
		removeStandaloneListener?.();
		removeInstallListener = null;
		removeInstalledListener = null;
		removeStandaloneListener = null;
		ready = false;
	}

	function openModal() {
		if (!browser) return;
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
	}

	async function triggerNativePrompt() {
		if (!deferredPrompt || promptInFlight) return;

		promptInFlight = true;
		try {
			await deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;
			lastOutcome = outcome;
			if (outcome === 'accepted') {
				modalOpen = false;
			}
			// beforeinstallprompt events are single-use per the Chromium install spec.
			deferredPrompt = null;
		} catch {
			// Prompt APIs can throw on user-gesture edge cases; the modal fallback still helps.
		} finally {
			promptInFlight = false;
		}
	}

	async function activate() {
		if (deferredPrompt) {
			await triggerNativePrompt();
			if (lastOutcome === 'dismissed') {
				modalOpen = true;
			}
			return;
		}

		modalOpen = true;
	}

	function markDismissed() {
		if (!browser) return;
		localStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
		dismissed = true;
	}

	return {
		get ready() {
			return ready;
		},
		get standalone() {
			return standalone;
		},
		get buttonVisible() {
			return buttonVisible;
		},
		get modalOpen() {
			return modalOpen;
		},
		get platform() {
			return platform;
		},
		get canPromptNatively() {
			return deferredPrompt !== null;
		},
		get promptInFlight() {
			return promptInFlight;
		},
		get dismissed() {
			return dismissed;
		},
		get lastOutcome() {
			return lastOutcome;
		},
		start,
		stop,
		activate,
		openModal,
		closeModal,
		triggerNativePrompt,
		markDismissed
	};
}

export const pwaInstallStore = createPwaInstallStore();
