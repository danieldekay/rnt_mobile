import { base } from '$app/paths';

export type NewsletterStatus =
	| 'subscribed'
	| 'unsubscribed'
	| 'unconfirmed'
	| 'bounced'
	| 'soft-bounced'
	| 'complained'
	| 'unknown';

export type NewsletterApiResponse = {
	ok: boolean;
	message: string;
	status?: NewsletterStatus;
	available?: boolean;
	already_subscribed?: boolean;
};

async function postNewsletter<T extends NewsletterApiResponse>(
	path: string,
	payload: Record<string, string>,
	options?: { throwOnError?: boolean }
): Promise<T> {
	const response = await fetch(`${base}${path}`, {
		method: 'POST',
		headers: {
			accept: 'application/json',
			'content-type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	const result = (await response.json().catch(() => null)) as T | null;
	if (!result) {
		throw new Error('Der Newsletter-Dienst hat ungueltig geantwortet.');
	}

	if (options?.throwOnError !== false && !response.ok && !result.ok) {
		throw new Error(result.message);
	}

	return result;
}

export function subscribeNewsletter(email: string, hp = '') {
	return postNewsletter('/api/newsletter/subscribe', { email, hp });
}

export function unsubscribeNewsletter(email: string) {
	return postNewsletter('/api/newsletter/unsubscribe', { email });
}

export function fetchNewsletterStatus(email: string) {
	return postNewsletter('/api/newsletter/status', { email }, { throwOnError: false });
}