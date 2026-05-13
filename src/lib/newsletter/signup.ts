import {
	subscribeNewsletter,
	unsubscribeNewsletter
} from '$lib/newsletter/sendy';

export type SignupResponse = {
	success: boolean;
	error: string | null;
	message: string;
	already_subscribed?: boolean;
};

function toSignupResponse(result: { ok: boolean; message: string; already_subscribed?: boolean }): SignupResponse {
	return {
		success: result.ok,
		error: result.ok ? null : result.message,
		message: result.message,
		already_subscribed: result.already_subscribed
	};
}

export async function subscribe(email: string, hp = ''): Promise<SignupResponse> {
	return toSignupResponse(await subscribeNewsletter(email, hp));
}

export async function unsubscribe(email: string): Promise<SignupResponse> {
	return toSignupResponse(await unsubscribeNewsletter(email));
}

export async function verifyEmail(token: string): Promise<SignupResponse> {
	const normalizedToken = token.trim().toLowerCase();

	if (normalizedToken === 'verified' || normalizedToken === 'success') {
		return {
			success: true,
			error: null,
			message: 'Deine E-Mail-Adresse wurde bestaetigt.'
		};
	}

	if (normalizedToken === 'failed' || normalizedToken === 'error') {
		return {
			success: false,
			error: 'verify_failed',
			message: 'Die Bestaetigung konnte nicht abgeschlossen werden.'
		};
	}

	return {
		success: false,
		error: 'unsupported',
		message: 'Die Bestaetigung wird direkt ueber den Link in der Sendy-E-Mail verarbeitet.'
	};
}