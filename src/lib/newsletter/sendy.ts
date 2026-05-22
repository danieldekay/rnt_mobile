import { base } from "$app/paths";

export type NewsletterStatus =
	| "subscribed"
	| "unsubscribed"
	| "unconfirmed"
	| "bounced"
	| "soft-bounced"
	| "complained"
	| "unknown";

export type NewsletterApiResponse = {
	ok: boolean;
	message: string;
	status?: NewsletterStatus;
	available?: boolean;
	already_subscribed?: boolean;
};

async function postNewsletterWithNonce<T extends NewsletterApiResponse>(
	path: string,
	payload: Record<string, string>,
	options?: { throwOnError?: boolean },
): Promise<T> {
	const response = await fetch(`${base}${path}`, {
		method: "POST",
		headers: {
			accept: "application/json",
			"content-type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	const result = (await response.json().catch(() => null)) as T | null;
	if (!result) {
		throw new Error("Der Newsletter-Dienst hat ungueltig geantwortet.");
	}

	if (options?.throwOnError !== false && !response.ok && !result.ok) {
		throw new Error(result.message);
	}

	return result;
}

export async function getNewsletterNonce(): Promise<string> {
	const response = await fetch(`${base}/api/newsletter/nonce`, {
		method: "GET",
		headers: { accept: "application/json" },
	});
	const result = await response.json();
	if (!result || !result.nonce) {
		throw new Error("Konnte keinen Newsletter-Nonce ermitteln.");
	}
	return result.nonce;
}

export function subscribeNewsletter(
	email: string,
	hp = "",
	nonce = "",
): Promise<NewsletterApiResponse> {
	return postNewsletterWithNonce("/api/newsletter/subscribe", {
		email,
		hp,
		nonce,
	});
}

export function unsubscribeNewsletter(
	email: string,
	nonce = "",
): Promise<NewsletterApiResponse> {
	return postNewsletterWithNonce("/api/newsletter/unsubscribe", {
		email,
		nonce,
	});
}

export function fetchNewsletterStatus(email: string) {
	return postNewsletterWithNonce(
		"/api/newsletter/status",
		{ email },
		{ throwOnError: false },
	);
}
