<script lang="ts">
	import { resolve } from '$app/paths';
	import { subscribe } from '$lib/newsletter/signup';
	import { trackFeatureEvent } from '$lib/matomo';

	type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

	interface Props {
		initialEmail?: string;
	}

	let { initialEmail = '' }: Props = $props();

	let collapsed = $state(true);
	let email = $state('');
	let website = $state('');
	let gdprConsent = $state(false);
	let submissionState = $state<SubmissionState>('idle');
	let message = $state('');

	$effect(() => {
		if (!email && initialEmail) {
			email = initialEmail;
		}
	});

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
			const result = await subscribe(normalizedEmail, website.trim());

			if (!result.success) {
				throw new Error(
					result.message ??
						'Die Anmeldung war gerade nicht moeglich. Bitte versuche es spaeter erneut.'
				);
			}

			submissionState = 'success';
			message = 'Vielen Dank fuer deine Anmeldung! Wir haben dir eine Bestaetigungs-E-Mail geschickt – bitte klicke dort auf den Link, um die Anmeldung abzuschliessen.';
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
	<button
		type="button"
		class="flex w-full items-center justify-between gap-3 text-left"
		onclick={() => { collapsed = !collapsed; }}
		aria-expanded={!collapsed}
		aria-controls="newsletter-form"
	>
		<div class="space-y-1">
			<p class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted">
				Newsletter
			</p>
			<h2 id="newsletter-title" class="font-display text-[1.5rem] font-semibold text-text-default">
				Neue Termine und Hinweise per Mail
			</h2>
		</div>
		<svg
			class="h-5 w-5 shrink-0 text-text-muted transition-transform {collapsed ? '' : 'rotate-180'}"
			fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
		</svg>
	</button>

	{#if !collapsed}
		<div id="newsletter-form" class="space-y-4">
			<p class="meta-text max-w-[48ch]">
				Kurze Updates zu neuen Funktionen und wichtigen RNT-Hinweisen. Abmeldung jederzeit ueber den Link in jeder Mail.
			</p>

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

		<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
			<button
				class="btn-primary w-full sm:w-auto"
				type="submit"
				disabled={!gdprConsent || submissionState === 'submitting'}
			>
				{submissionState === 'submitting' ? 'Anmeldung laeuft...' : 'Newsletter abonnieren'}
			</button>
		</div>

		<div aria-live="polite" class="min-h-6 text-[0.9375rem] font-medium {submissionState === 'error' ? 'text-[rgb(var(--event-type-milonga))]' : submissionState === 'success' ? 'text-text-default' : 'text-text-muted'}">
			{#if message}
				{message}
			{/if}
		</div>

		<p class="meta-text">
			Abmelden oder Status pruefen:
			<a href={resolve('/newsletter')} class="underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default">
				Newsletter-Seite
			</a>
		</p>
	</form>
		</div>
	{/if}
</section>