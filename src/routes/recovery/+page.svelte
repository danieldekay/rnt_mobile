<script lang="ts">
	import { browser, version } from '$app/environment';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { trackFeatureEvent } from '$lib/matomo';
	import { mapHubPageSeo } from '$lib/seo/pages';
	import { APP_CACHE_PREFIX, buildRecoveryUrl, recoverAppShell } from '$lib/pwa/recovery';

	const seo = mapHubPageSeo('recovery');

	type RecoveryState = 'idle' | 'running' | 'done' | 'error';

	let state = $state<RecoveryState>('idle');
	let message = $state('');
	let deletedCaches = $state<string[]>([]);
	let unregisteredServiceWorkers = $state(0);
	let serviceWorkerSupported = $state(false);
	let cacheStorageSupported = $state(false);
	let currentUrl = $state('');
	let nextUrl = $state('');

	onMount(() => {
		if (!browser) return;
		serviceWorkerSupported = 'serviceWorker' in navigator;
		cacheStorageSupported = 'caches' in window;
		currentUrl = window.location.href;
		nextUrl = buildRecoveryUrl(window.location.href, Date.now(), 'manual');
	});

	async function runRecovery() {
		if (!browser || state === 'running') return;

		state = 'running';
		message = 'App-Speicher wird bereinigt…';
		deletedCaches = [];
		unregisteredServiceWorkers = 0;
		trackFeatureEvent('pwa_recovery', 'manual_start');

		try {
			const result = await recoverAppShell({
				serviceWorker: serviceWorkerSupported ? navigator.serviceWorker : null,
				cacheStorage: cacheStorageSupported ? caches : null,
			});

			deletedCaches = result.deletedCaches;
			unregisteredServiceWorkers = result.unregisteredServiceWorkers;
			state = 'done';
			message = 'Bereinigung abgeschlossen. Die App wird mit frischer Adresse neu geladen.';
			trackFeatureEvent(
				'pwa_recovery',
				'manual_success',
				`${unregisteredServiceWorkers}sw:${deletedCaches.length}caches`,
			);

			window.setTimeout(() => {
				window.location.replace(buildRecoveryUrl(window.location.origin + '/', Date.now(), 'manual'));
			}, 900);
		} catch (error) {
			state = 'error';
			message = error instanceof Error ? error.message : 'Die App-Reparatur ist fehlgeschlagen.';
			trackFeatureEvent('pwa_recovery', 'manual_error', message);
		}
	}
</script>

<SeoHead {seo} />

<div class="page-stack">
	<section class="card p-5" aria-labelledby="recovery-heading">
		<div class="space-y-2">
			<p class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted">
				App-Reparatur
			</p>
			<h1 id="recovery-heading" class="font-display text-[2rem] font-semibold text-text-default">
				App reparieren
			</h1>
			<p class="meta-text max-w-[55ch]">
				Diese Seite entfernt lokal gespeicherte RNT-App-Caches und registrierte Service Worker. Sie hilft, wenn Safari, ein Lesezeichen oder die installierte App noch eine alte Ansicht zeigt.
			</p>
		</div>

		<div class="mt-5 rounded-control border border-border-default bg-surface-subtle p-4">
			<p class="text-[0.9375rem] font-medium text-text-default">Was passiert?</p>
			<ol class="mt-2 list-decimal space-y-1 pl-5 text-sm text-text-muted">
				<li>Alle registrierten Service Worker dieser App werden abgemeldet.</li>
				<li>Nur Caches mit dem Präfix <code>{APP_CACHE_PREFIX}</code> werden gelöscht.</li>
				<li>Die Startseite wird mit einem Cache-Buster neu geöffnet.</li>
			</ol>
		</div>

		<div class="mt-5 grid gap-3 sm:grid-cols-2">
			<div class="rounded-control border border-border-default bg-surface-card p-4">
				<p class="meta-text">Service Worker</p>
				<p class="text-[1rem] font-semibold text-text-default">
					{serviceWorkerSupported ? 'unterstützt' : 'nicht verfügbar'}
				</p>
			</div>
			<div class="rounded-control border border-border-default bg-surface-card p-4">
				<p class="meta-text">Cache Storage</p>
				<p class="text-[1rem] font-semibold text-text-default">
					{cacheStorageSupported ? 'unterstützt' : 'nicht verfügbar'}
				</p>
			</div>
		</div>

		<div class="mt-5 flex flex-wrap gap-3">
			<button class="btn-primary" type="button" onclick={runRecovery} disabled={state === 'running'}>
				{state === 'running' ? 'Reparatur läuft…' : 'App jetzt reparieren'}
			</button>
			<a class="btn-secondary" href={resolve('/app-status')}>App-Status ansehen</a>
			<a class="btn-secondary" href={resolve('/')}>Zur Startseite</a>
		</div>

		{#if message}
			<div class="mt-5 rounded-control border border-border-default bg-surface-subtle p-4" role="status" aria-live="polite">
				<p class="text-[0.9375rem] font-medium text-text-default">{message}</p>
				{#if state === 'done'}
					<p class="meta-text mt-2">
						Abgemeldete Service Worker: {unregisteredServiceWorkers}. Gelöschte App-Caches: {deletedCaches.length}.
					</p>
				{/if}
			</div>
		{/if}
	</section>

	<section class="card p-5">
		<h2 class="section-title">Aktuelle Diagnose</h2>
		<dl class="mt-3 space-y-3 text-sm">
			<div>
				<dt class="font-medium text-text-default">App-Version</dt>
				<dd class="text-text-muted">{version}</dd>
			</div>
			<div>
				<dt class="font-medium text-text-default">Aktuelle Adresse</dt>
				<dd class="break-all text-text-muted">{currentUrl || '—'}</dd>
			</div>
			<div>
				<dt class="font-medium text-text-default">Nächste Reparatur-Adresse</dt>
				<dd class="break-all text-text-muted">{nextUrl || '—'}</dd>
			</div>
		</dl>
	</section>
</div>
