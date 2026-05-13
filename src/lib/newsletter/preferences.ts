import {
	fetchNewsletterStatus,
	type NewsletterStatus
} from '$lib/newsletter/sendy';
import { subscribe, unsubscribe } from '$lib/newsletter/signup';

export type PreferenceState = {
	email: string;
	subscribed: boolean;
	categories: string[];
	frequency: 'daily' | 'weekly' | 'monthly';
	status: NewsletterStatus;
	available: boolean;
};

function toPreferenceState(
	email: string,
	status: NewsletterStatus,
	available: boolean
): PreferenceState {
	return {
		email,
		subscribed: status === 'subscribed' || status === 'unconfirmed',
		categories: [],
		frequency: 'weekly',
		status,
		available
	};
}

export async function getPreferences(email: string): Promise<PreferenceState> {
	const result = await fetchNewsletterStatus(email);

	return toPreferenceState(email, result.status ?? 'unknown', result.available !== false);
}

export async function updatePreferences(prefs: PreferenceState): Promise<PreferenceState> {
	if (prefs.subscribed) {
		await subscribe(prefs.email);
	} else {
		await unsubscribe(prefs.email);
	}

	return prefs;
}

export async function subscribeWithPreferences(email: string): Promise<PreferenceState> {
	await subscribe(email);
	return toPreferenceState(email, 'unconfirmed', true);
}