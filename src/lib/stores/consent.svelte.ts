import { browser } from '$app/environment';

export type ConsentCategory = 'essential' | 'analytics' | 'maps';

export interface ConsentPreferences {
	essential: true;
	analytics: boolean;
	maps: boolean;
}

export interface ConsentSnapshot {
	version: number;
	decided: boolean;
	updatedAt: string | null;
	preferences: ConsentPreferences;
}

const CONSENT_STORAGE_KEY = 'rnt-consent';
const CONSENT_VERSION = 1;

const DEFAULT_PREFERENCES: ConsentPreferences = {
	essential: true,
	analytics: false,
	maps: false
};

function createDefaultSnapshot(): ConsentSnapshot {
	return {
		version: CONSENT_VERSION,
		decided: false,
		updatedAt: null,
		preferences: { ...DEFAULT_PREFERENCES }
	};
}

function normalizeSnapshot(value: unknown): ConsentSnapshot {
	if (!value || typeof value !== 'object') {
		return createDefaultSnapshot();
	}

	const candidate = value as Partial<ConsentSnapshot> & {
		preferences?: Partial<ConsentPreferences>;
	};

	if (candidate.version !== CONSENT_VERSION) {
		return createDefaultSnapshot();
	}

	return {
		version: CONSENT_VERSION,
		decided: candidate.decided === true,
		updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : null,
		preferences: {
			essential: true,
			analytics: candidate.preferences?.analytics === true,
			maps: candidate.preferences?.maps === true
		}
	};
}

function createConsentStore() {
	let snapshot = $state<ConsentSnapshot>(createDefaultSnapshot());
	let ready = $state(false);
	let settingsOpen = $state(false);

	function persist() {
		if (!browser) return;
		localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(snapshot));
	}

	function setSnapshot(next: ConsentSnapshot) {
		snapshot = next;
		persist();
	}

	function load() {
		if (!browser) {
			ready = true;
			return;
		}

		try {
			const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
			snapshot = raw ? normalizeSnapshot(JSON.parse(raw)) : createDefaultSnapshot();
		} catch {
			snapshot = createDefaultSnapshot();
		}

		ready = true;
	}

	function updatePreferences(preferences: Partial<Omit<ConsentPreferences, 'essential'>>) {
		setSnapshot({
			version: CONSENT_VERSION,
			decided: true,
			updatedAt: new Date().toISOString(),
			preferences: {
				essential: true,
				analytics: preferences.analytics ?? snapshot.preferences.analytics,
				maps: preferences.maps ?? snapshot.preferences.maps
			}
		});
	}

	function acceptAll() {
		updatePreferences({ analytics: true, maps: true });
		settingsOpen = false;
	}

	function rejectOptional() {
		updatePreferences({ analytics: false, maps: false });
		settingsOpen = false;
	}

	function savePreferences(preferences: Partial<Omit<ConsentPreferences, 'essential'>>) {
		updatePreferences(preferences);
		settingsOpen = false;
	}

	function setCategory(category: Exclude<ConsentCategory, 'essential'>, value: boolean) {
		updatePreferences({ [category]: value });
	}

	function openSettings() {
		settingsOpen = true;
	}

	function closeSettings() {
		settingsOpen = false;
	}

	function reset() {
		setSnapshot(createDefaultSnapshot());
		settingsOpen = false;
	}

	load();

	return {
		get ready() {
			return ready;
		},
		get settingsOpen() {
			return settingsOpen;
		},
		get snapshot() {
			return snapshot;
		},
		get preferences() {
			return snapshot.preferences;
		},
		get hasDecision() {
			return snapshot.decided;
		},
		get shouldShowBanner() {
			return ready && !snapshot.decided;
		},
		hasConsent(category: ConsentCategory) {
			return snapshot.preferences[category];
		},
		acceptAll,
		rejectOptional,
		savePreferences,
		setCategory,
		openSettings,
		closeSettings,
		reset
	};
}

export const consentStore = createConsentStore();