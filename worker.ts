interface Env {
	ASSETS: Fetcher;
	SENDY_BASE_URL?: string;
	SENDY_LIST_ID?: string;
}

type JsonBody = {
	ok: boolean;
	message: string;
};

const NEWSLETTER_PATH = '/api/newsletter/subscribe';
const REQUEST_TIMEOUT_MS = 8000;
const GENERIC_ERROR_MESSAGE =
	'Die Anmeldung war gerade nicht moeglich. Bitte versuche es spaeter erneut.';
const SUCCESS_MESSAGE =
	'Danke. Bitte pruefe dein Postfach, falls deine Anmeldung bestaetigt werden muss.';

export default {
	async fetch(request, env): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === NEWSLETTER_PATH) {
			return handleNewsletterSubscribe(request, env);
		}

		return env.ASSETS.fetch(request);
	}
} satisfies ExportedHandler<Env>;

async function handleNewsletterSubscribe(request: Request, env: Env): Promise<Response> {
	if (request.method !== 'POST') {
		return json({ ok: false, message: 'Methode nicht erlaubt.' }, 405);
	}

	const requestUrl = new URL(request.url);
	const origin = request.headers.get('origin');
	if (origin && origin !== requestUrl.origin) {
		return json({ ok: false, message: 'Ungueltige Herkunft.' }, 403);
	}

	const config = getSendyConfig(env);
	if (!config.ok) {
		return json({ ok: false, message: config.message }, 500);
	}

	const payload = await parseRequestPayload(request);
	if (!payload.ok) {
		return json({ ok: false, message: payload.message }, 400);
	}

	if (payload.hp.length > 0) {
		return json({ ok: true, message: SUCCESS_MESSAGE }, 200);
	}

	const sendyBody = new URLSearchParams({
		email: payload.email,
		list: config.listId,
		gdpr: 'true',
		hp: ''
	});

	try {
		const response = await fetchWithTimeout(new URL('/subscribe', config.baseUrl).toString(), {
			method: 'POST',
			headers: {
				accept: 'text/plain',
				'content-type': 'application/x-www-form-urlencoded'
			},
			body: sendyBody.toString()
		});

		const sendyText = (await response.text()).trim();
		const normalized = normalizeSendyResponse(response.ok, sendyText);
		return json(normalized.body, normalized.status);
	} catch (error) {
		const message = isAbortError(error)
			? 'Die Anmeldung hat zu lange gedauert. Bitte versuche es erneut.'
			: GENERIC_ERROR_MESSAGE;
		const status = isAbortError(error) ? 504 : 502;
		return json({ ok: false, message }, status);
	}
}

function getSendyConfig(env: Env):
	| { ok: true; baseUrl: string; listId: string }
	| { ok: false; message: string } {
	const baseUrl = env.SENDY_BASE_URL?.trim().replace(/\/$/, '');
	const listId = env.SENDY_LIST_ID?.trim();

	if (!baseUrl || !listId) {
		return {
			ok: false,
			message: 'Newsletter-Konfiguration fehlt auf dem Server.'
		};
	}

	return { ok: true, baseUrl, listId };
}

async function parseRequestPayload(request: Request): Promise<
	| { ok: true; email: string; hp: string }
	| { ok: false; message: string }
> {
	const contentType = request.headers.get('content-type') ?? '';
	let email = '';
	let hp = '';

	if (contentType.includes('application/json')) {
		const body = (await request.json().catch(() => null)) as
			| { email?: unknown; hp?: unknown }
			| null;
		email = typeof body?.email === 'string' ? body.email.trim() : '';
		hp = typeof body?.hp === 'string' ? body.hp.trim() : '';
	} else {
		const formData = await request.formData();
		email = String(formData.get('email') ?? '').trim();
		hp = String(formData.get('hp') ?? formData.get('website') ?? '').trim();
	}

	if (!email) {
		return { ok: false, message: 'Bitte gib eine E-Mail-Adresse ein.' };
	}

	if (!isValidEmailAddress(email)) {
		return { ok: false, message: 'Bitte pruefe die E-Mail-Adresse.' };
	}

	return { ok: true, email, hp };
}

function isValidEmailAddress(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		return await fetch(input, {
			...init,
			signal: controller.signal
		});
	} finally {
		clearTimeout(timeoutId);
	}
}

function normalizeSendyResponse(responseOk: boolean, sendyText: string): {
	status: number;
	body: JsonBody;
} {
	const normalizedText = sendyText.trim();
	const lower = normalizedText.toLowerCase();

	if (responseOk && normalizedText === '1') {
		return {
			status: 200,
			body: { ok: true, message: SUCCESS_MESSAGE }
		};
	}

	if (lower.includes('already subscribed')) {
		return {
			status: 200,
			body: { ok: true, message: 'Diese Adresse ist bereits fuer den Newsletter eingetragen.' }
		};
	}

	if (lower.includes('invalid email')) {
		return {
			status: 400,
			body: { ok: false, message: 'Bitte pruefe die E-Mail-Adresse.' }
		};
	}

	if (lower.includes('some fields are missing')) {
		return {
			status: 400,
			body: { ok: false, message: 'Bitte gib eine E-Mail-Adresse ein.' }
		};
	}

	return {
		status: responseOk ? 502 : 500,
		body: { ok: false, message: GENERIC_ERROR_MESSAGE }
	};
}

function isAbortError(error: unknown): boolean {
	return error instanceof Error && error.name === 'AbortError';
}

function json(body: JsonBody, status: number): Response {
	return Response.json(body, {
		status,
		headers: {
			'cache-control': 'no-store'
		}
	});
}