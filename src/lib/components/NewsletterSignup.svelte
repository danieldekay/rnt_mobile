<script lang="ts">
	import { base, resolve } from '$app/paths';
	import { trackFeatureEvent } from '$lib/matomo';

	type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

	const subscribeEndpoint = `${base}/api/newsletter/subscribe`;

	let email = $state('');
	let website = $state('');
	let submissionState = $state<SubmissionState>('idle');
	let message = $state('');

	function validateEmailAddress(value: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
	}

	function setError(messageText: string) {
		submissionState = 'error';
		message = messageText;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const normalizedEmail = email.trim();

		if (!normalizedEmail) {
			setError('Bitte gib eine E-Mail-Adresse ein.');
			return;
		}

		if (!validateEmailAddress(normalizedEmail)) {
			setError('Bitte pruefe die E-Mail-Adresse.');
			return;
		}

		submissionState = 'submitting';
		message = '';
		trackFeatureEvent('newsletter', 'submit');

		try {
			const response = await fetch(subscribeEndpoint, {
				method: 'POST',
				headers: {
					accept: 'application/json',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					email: normalizedEmail,
					hp: website.trim()
				})
			});

			const result = (await response.json().catch(() => null)) as
				| { ok?: boolean; message?: string }
				| null;

			if (!response.ok || !result?.ok) {
				throw new Error(
					result?.message ??
						'Die Anmeldung war gerade nicht moeglich. Bitte versuche es spaeter erneut.'
				);
			}

			submissionState = 'success';
			message =
				result.message ??
				'Danke. Bitte pruefe dein Postfach, falls deine Anmeldung bestaetigt werden muss.';
			email = '';
			website = '';
			trackFeatureEvent('newsletter', 'success');
		} catch (error) {
			const fallbackMessage = 'Die Anmeldung war gerade nicht moeglich. Bitte versuche es spaeter erneut.';
			const errorMessage = error instanceof Error && error.message ? error.message : fallbackMessage;
			setError(errorMessage);
			trackFeatureEvent('newsletter', 'error');
		}
	}
</script>

<section class="card space-y-4 p-5 text-left" aria-labelledby="newsletter-title">
	<div class="space-y-1">
		<p class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted">
			Newsletter
		</p>
		<h2 id="newsletter-title" class="font-display text-[1.5rem] font-semibold text-text-default">
			Neue Termine und Hinweise per Mail
		</h2>
		<p class="meta-text max-w-[48ch]">
			Kurze Updates zu neuen Funktionen und wichtigen RNT-Hinweisen. Abmeldung jederzeit ueber den Link in jeder Mail.
		</p>
	</div>

	<form class="space-y-3" onsubmit={handleSubmit} novalidate>
		<div class="space-y-2">
			<label class="text-[0.9375rem] font-medium text-text-default" for="newsletter-email">
				E-Mail-Adresse
			</label>
			<input
				id="newsletter-email"
				type="email"
				name="email"
				autocomplete="email"
				inputmode="email"
				required
				placeholder="name@beispiel.de"
				bind:value={email}
				class="field-input"
			/>
		</div>

		<div class="hidden" aria-hidden="true">
			<label for="newsletter-website">Website</label>
			<input
				id="newsletter-website"
				type="text"
				name="website"
				tabindex="-1"
				autocomplete="off"
				bind:value={website}
			/>
		</div>

		<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
			<button class="btn-primary w-full sm:w-auto" type="submit" disabled={submissionState === 'submitting'}>
				{submissionState === 'submitting' ? 'Anmeldung laeuft...' : 'Newsletter abonnieren'}
			</button>
			<p class="meta-text">
				Mit dem Absenden akzeptierst du die Hinweise in
				<a href={resolve('/datenschutz')} class="underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default">
					der Datenschutzerklaerung
				</a>.
			</p>
		</div>

		<div aria-live="polite" class="min-h-6 text-[0.9375rem] font-medium {submissionState === 'error' ? 'text-[rgb(var(--event-type-milonga))]' : submissionState === 'success' ? 'text-text-default' : 'text-text-muted'}">
			{#if message}
				{message}
			{/if}
		</div>
	</form>
</section>