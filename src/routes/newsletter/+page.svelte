<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { getPreferences } from '$lib/newsletter/preferences';
	import { subscribe, unsubscribe } from '$lib/newsletter/signup';
	import { trackFeatureEvent } from '$lib/matomo';

	type PageState =
		| 'idle'
		| 'checking'
		| 'subscribed'
		| 'unconfirmed'
		| 'not_subscribed'
		| 'bounced'
		| 'complained'
		| 'unavailable'
		| 'submitting'
		| 'error';

	let email = $state('');
	let pageState = $state<PageState>('idle');
	let message = $state('');
	let gdprConsent = $state(false);
	let statusAvailable = $state(true);
	let verifyBanner = $state('');
	let verifyOk = $state(false);

	const canSubscribe = $derived(
		pageState === 'idle' ||
		pageState === 'not_subscribed' ||
		pageState === 'unavailable' ||
		pageState === 'error'
	);

	function isValidEmail(v: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
	}

	onMount(async () => {
		const params = new URLSearchParams(window.location.search);
		const urlEmail = params.get('email')?.trim() ?? '';
		const verifyToken = params.get('verify');

		if (verifyToken) {
			verifyOk = ['verified', 'success'].includes(verifyToken.toLowerCase());
			verifyBanner = verifyOk
				? 'Deine E-Mail-Adresse wurde bestaetigt. Du bist jetzt angemeldet.'
				: 'Die Bestaetigung wird ueber den Link in der Bestaetigungs-E-Mail verarbeitet.';
		}

		if (urlEmail) {
			email = urlEmail;
			if (isValidEmail(urlEmail)) {
				await checkStatus();
			}
		}
	});

	async function checkStatus() {
		const trimmed = email.trim();
		if (!isValidEmail(trimmed)) {
			message = 'Bitte gib eine gueltige E-Mail-Adresse ein.';
			pageState = 'error';
			return;
		}

		pageState = 'checking';
		message = '';
		trackFeatureEvent('newsletter', 'status_request');

		try {
			const prefs = await getPreferences(trimmed);
			statusAvailable = prefs.available;

			if (!prefs.available) {
				pageState = 'unavailable';
				return;
			}

			switch (prefs.status) {
				case 'subscribed':
					pageState = 'subscribed';
					break;
				case 'unconfirmed':
					pageState = 'unconfirmed';
					break;
				case 'bounced':
				case 'soft-bounced':
					pageState = 'bounced';
					message =
						'Die Zustellung an diese Adresse ist fehlgeschlagen (Hard Bounce). Bitte pruefe die Adresse oder wende dich an uns.';
					break;
				case 'complained':
					pageState = 'complained';
					message =
						'Diese Adresse wurde als Spam markiert. Eine erneute Anmeldung ist nicht moeglich.';
					break;
				default:
					pageState = 'not_subscribed';
					break;
			}
		} catch (err) {
			pageState = 'error';
			message =
				err instanceof Error ? err.message : 'Der Status konnte gerade nicht abgerufen werden.';
		}
	}

	async function handleSubscribe(event: SubmitEvent) {
		event.preventDefault();
		if (!gdprConsent) return;

		const trimmed = email.trim();
		if (!isValidEmail(trimmed)) {
			message = 'Bitte gib eine gueltige E-Mail-Adresse ein.';
			pageState = 'error';
			return;
		}

		pageState = 'submitting';
		message = '';
		trackFeatureEvent('newsletter', 'submit');

		try {
			const result = await subscribe(trimmed);
			message = result.message;

			if (result.success && result.already_subscribed) {
				pageState = 'subscribed';
				message = 'Diese Adresse ist bereits bei uns angemeldet.';
				trackFeatureEvent('newsletter', 'already_subscribed');
			} else if (result.success) {
				message = 'Vielen Dank fuer deine Anmeldung! Wir haben dir eine Bestaetigungs-E-Mail geschickt – bitte klicke dort auf den Link, um die Anmeldung abzuschliessen.';
				pageState = 'unconfirmed';
				trackFeatureEvent('newsletter', 'success');
			} else {
				pageState = 'error';
				trackFeatureEvent('newsletter', 'error');
			}
		} catch (err) {
			pageState = 'error';
			message = err instanceof Error ? err.message : 'Die Anmeldung war gerade nicht moeglich.';
			trackFeatureEvent('newsletter', 'error');
		}
	}

	async function handleUnsubscribe() {
		const trimmed = email.trim();
		if (!isValidEmail(trimmed)) return;

		pageState = 'submitting';
		message = '';
		trackFeatureEvent('newsletter', 'unsubscribe');

		try {
			const result = await unsubscribe(trimmed);
			message = result.message;
			pageState = result.success ? 'not_subscribed' : 'error';
		} catch (err) {
			pageState = 'error';
			message = err instanceof Error ? err.message : 'Die Abmeldung war gerade nicht moeglich.';
		}
	}

	function resetForm() {
		email = '';
		pageState = 'idle';
		message = '';
		gdprConsent = false;
	}
</script>

<svelte:head>
	<title>Newsletter – RNT Kalender</title>
</svelte:head>

<div class="space-y-4">
	{#if verifyBanner}
		<section class="card p-5" role="status">
			<p
				class="text-[1rem] font-medium {verifyOk
					? 'text-text-default'
					: 'text-[rgb(var(--event-type-milonga))]'}"
			>
				{verifyBanner}
			</p>
		</section>
	{/if}

	<section class="card p-5" aria-labelledby="newsletter-heading">
		<div class="space-y-1 mb-5">
			<p class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted">
				Newsletter
			</p>
			<h1
				id="newsletter-heading"
				class="font-display text-[2rem] font-semibold text-text-default"
			>
				Newsletter
			</h1>
			<p class="meta-text max-w-[48ch]">
				Kurze Updates zu neuen Funktionen, wichtigen RNT-Hinweisen und Terminen. Abmeldung
				jederzeit ueber den Link in jeder Mail.
			</p>
		</div>

		<div class="space-y-4">
			<!-- Email field + optional status check button -->
			<div class="space-y-2">
				<label class="text-[0.9375rem] font-medium text-text-default" for="nl-email">
					E-Mail-Adresse
				</label>
				<div class="flex gap-2">
					<input
						id="nl-email"
						type="email"
						autocomplete="email"
						inputmode="email"
						placeholder="name@beispiel.de"
						bind:value={email}
						oninput={() => {
							if (pageState !== 'idle' && pageState !== 'checking') {
								pageState = 'idle';
								message = '';
								gdprConsent = false;
							}
						}}
						class="field-input flex-1"
					/>
					{#if statusAvailable}
						<button
							class="btn-secondary whitespace-nowrap"
							type="button"
							disabled={pageState === 'checking' || pageState === 'submitting'}
							onclick={checkStatus}
						>
							{pageState === 'checking' ? 'Pruefung laeuft\u2026' : 'Status pruefen'}
						</button>
					{/if}
				</div>
			</div>

			<!-- Already subscribed -->
			{#if pageState === 'subscribed'}
				<div
					class="rounded-control border border-border-default bg-surface-subtle p-4 space-y-3"
					role="status"
				>
					<p class="text-[0.9375rem] font-medium text-text-default">
						Diese Adresse ist bereits angemeldet.
					</p>
					{#if message && message !== 'Diese Adresse ist bereits angemeldet.'}
						<p class="meta-text">{message}</p>
					{/if}
					<button
						class="btn-secondary"
						type="button"
						onclick={handleUnsubscribe}
					>
						Vom Newsletter abmelden
					</button>
				</div>

			<!-- Awaiting confirmation -->
			{:else if pageState === 'unconfirmed'}
				<div
					class="rounded-control border border-border-default bg-surface-subtle p-4 space-y-3"
					role="status"
				>
					<p class="text-[0.9375rem] font-medium text-text-default">
						{message || 'Bestaetigung ausstehend. Bitte pruefe dein Postfach und klicke den Bestaetigungs-Link.'}
					</p>
					<button
						class="btn-secondary"
						type="button"
						onclick={handleUnsubscribe}
					>
						Abmeldung beantragen
					</button>
				</div>

			<!-- Bounce / complaint — info only, no action -->
			{:else if pageState === 'bounced' || pageState === 'complained'}
				<div
					class="rounded-control border border-border-default bg-surface-subtle p-4"
					role="status"
				>
					<p class="text-[0.9375rem] text-text-muted">{message}</p>
				</div>

			<!-- Subscribe form (idle / not_subscribed / unavailable / error) -->
			{:else if canSubscribe}
				<form onsubmit={handleSubscribe} novalidate class="space-y-3">
					<label class="flex cursor-pointer items-start gap-3">
						<input
							type="checkbox"
							bind:checked={gdprConsent}
							class="mt-0.5 h-4 w-4 shrink-0 accent-[rgb(var(--color-primary))]"
						/>
						<span class="text-[0.875rem] leading-relaxed text-text-muted">
							Ich habe die
							<a
								href={resolve('/datenschutz')}
								class="underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default"
							>
								Datenschutzerklaerung
							</a>
							gelesen und bin einverstanden.
						</span>
					</label>
					<button
						class="btn-primary w-full sm:w-auto"
						type="submit"
						disabled={!gdprConsent || pageState === 'submitting'}
					>
						{pageState === 'submitting' ? 'Anmeldung laeuft\u2026' : 'Newsletter abonnieren'}
					</button>
				</form>
			{/if}

			<!-- General action message (errors, unsubscribed-ok) -->
			{#if message && pageState !== 'subscribed' && pageState !== 'unconfirmed' && pageState !== 'bounced' && pageState !== 'complained'}
				<p
					aria-live="polite"
					class="text-[0.9375rem] font-medium {pageState === 'error'
						? 'text-[rgb(var(--event-type-milonga))]'
						: 'text-text-default'}"
				>
					{message}
				</p>
			{/if}

			<!-- "Check another address" after successful unsubscribe -->
			{#if pageState === 'not_subscribed' && message}
				<button
					class="text-[0.875rem] text-text-muted underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default"
					type="button"
					onclick={resetForm}
				>
					Andere Adresse pruefen
				</button>
			{/if}
		</div>
	</section>
</div>
