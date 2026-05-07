<script lang="ts">
	import { base } from '$app/paths';
	import NewsletterSignup from '$lib/components/NewsletterSignup.svelte';
	import { trackFeatureEvent } from '$lib/matomo';

	let unsubState = $state('idle');
	let unsubMessage = $state('');
	let unsubEmail = $state('');
	let showUnsub = $state(false);

	async function submitUnsub() {
		unsubState = 'submitting';
		unsubMessage = '';
		const email = unsubEmail.trim();
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			unsubState = 'error';
			unsubMessage = 'Bitte gib eine gueltige E-Mail-Adresse ein.';
			return;
				}
		try {
			const response = await fetch(`${base}/api/newsletter/unsub`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ email: email })
					});
			const data = await response.json().catch(() => null);
			if (response.ok || data?.ok) {
				unsubState = 'success';
				unsubMessage = 'Du wurdest erfolgreich vom Newsletter abgemeldet.';
					} else {
				unsubState = 'error';
				unsubMessage = data?.message || 'Abmeldung fehlgeschlagen. Bitte versuche es spaeter erneut.';
					}
				} catch {
			unsubState = 'error';
			unsubMessage = 'Die Abmeldung scheiterte. Versuche es spaeter erneut.';
				}
			}
</script>

<svelte:head>
	<title>Newsletter abonnieren - RNT Kalender</title>
</svelte:head>

<div class="space-y-4">
	<section class="card p-5" aria-labelledby="newsletter-heading">
				<div class="space-y-1">
					<p class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted">Newsletter</p>
					<h1 id="newsletter-heading" class="font-display text-[2rem] font-semibold text-text-default">Newsletter abonnieren</h1>
					<p class="meta-text max-w-[48ch]">Kurze Updates zu neuen Funktionen, wichtigen RNT-Hinweisen und Termininformationen.</p>
				</div>
			</section>
			<section class="card p-5">
				<h2 class="font-display text-[1.25rem] font-semibold text-text-default mb-2">Abonnieren</h2>
				<NewsletterSignup />
			</section>
			<section class="card p-5" aria-labelledby="unsub-heading">
				<h2 id="unsub-heading" class="font-display text-[1.25rem] font-semibold text-text-default">Newsletter abmelden</h2>
				<details open={showUnsub} class="mt-4">
					<summary class="cursor-pointer font-medium text-text-default">Newsletter abmelden</summary>
					<form class="space-y-3 mt-3" onsubmit={(e) => { e.preventDefault(); submitUnsub(); }}>
						<input type="email" bind:value={unsubEmail} placeholder="name@beispiel.de" class="field-input w-full" required />
						<button class="btn-secondary w-full" type="submit" disabled={unsubState === 'submitting'}>
							{unsubState === 'submitting' ? 'Abmeldung laeuft...' : 'Abmelden'}
						</button>
						{#if unsubMessage}
							<p class="text-sm font-medium {unsubState === 'success' ? 'text-text-default' : 'text-[rgb(var(--event-type-milonga))]'}">
								{unsubMessage}
							</p>
						{/if}
					</form>
				</details>
			</section>
		</div>
