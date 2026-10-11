<script lang="ts">
	import { browser, version } from '$app/environment';
	import { resolve } from '$app/paths';
	import { updated } from '$app/state';
	import { onMount } from 'svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { trackFeatureEvent } from '$lib/matomo';
	import { APP_CACHE_PREFIX, getAppCacheNames } from '$lib/pwa/recovery';
	import { mapHubPageSeo } from '$lib/seo/pages';
	import { pwaUpdateStore } from '$lib/stores/pwa-update.svelte';

	const seo = mapHubPageSeo('app-status');

	type ServiceWorkerStatus = {
		supported: boolean;
		controller: string | null;
		scope: string | null;
		active: string | null;
		waiting: string | null;
		installing: string | null;
	};

	type Diagnostics = {
		collectedAt: string;
		appVersion: string;
		displayMode: string;
		online: boolean;
		currentUrl: string;
		userAgent: string;
		serviceWorker: ServiceWorkerStatus;
		appCaches: string[];
		cacheStorageSupported: boolean;
	};

	let diagnostics = $state<Diagnostics | null>(null);
	let loading = $state(true);
	let checkMessage = $state('');
	let copyMessage = $state('');

	onMount(() => {
		void refreshDiagnostics();
		trackFeatureEvent('app_status', 'view');
	});

	function getDisplayMode(): string {
		if (!browser) return 'server';
		if ((navigator as unknown as { standalone?: boolean }).standalone === true) return 'ios-standalone';

		const modes = ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
		return modes.find((mode) => window.matchMedia(`(display-mode: ${mode})`).matches) ?? 'unknown';
	}

	async function getServiceWorkerStatus(): Promise<ServiceWorkerStatus> {
		if (!browser || !('serviceWorker' in navigator)) {
			return {
				supported: false,
				controller: null,
				scope: null,
				active: null,
				waiting: null,
				installing: null,
			};
		}

		const registration = await navigator.serviceWorker.getRegistration();
		return {
			supported: true,
			controller: navigator.serviceWorker.controller?.scriptURL ?? null,
			scope: registration?.scope ?? null,
			active: registration?.active ? `${registration.active.state}: ${registration.active.scriptURL}` : null,
			waiting: registration?.waiting ? `${registration.waiting.state}: ${registration.waiting.scriptURL}` : null,
			installing: registration?.installing ? `${registration.installing.state}: ${registration.installing.scriptURL}` : null,
		};
	}

	async function getAppCaches(): Promise<string[]> {
		if (!browser || !('caches' in window)) return [];
		return getAppCacheNames(await caches.keys());
	}

	async function refreshDiagnostics() {
		if (!browser) return;

		loading = true;
		copyMessage = '';
		try {
			diagnostics = {
				collectedAt: new Date().toISOString(),
				appVersion: version,
				displayMode: getDisplayMode(),
				online: navigator.onLine,
				currentUrl: window.location.href,
				userAgent: navigator.userAgent,
				serviceWorker: await getServiceWorkerStatus(),
				appCaches: await getAppCaches(),
				cacheStorageSupported: 'caches' in window,
			};
		} finally {
			loading = false;
		}
	}

	async function checkForUpdates() {
		checkMessage = 'Update-Prüfung läuft…';
		trackFeatureEvent('app_status', 'manual_update_check');
		const available = await pwaUpdateStore.checkForUpdate(() => updated.check());
		checkMessage = available ? 'Update verfügbar.' : 'Keine neuere Version gefunden.';
		await refreshDiagnostics();
	}

	function asDiagnosticJson(): string {
		return JSON.stringify(
			{
				diagnostics,
				update: {
					state: pwaUpdateStore.checkState,
					hasUpdate: pwaUpdateStore.hasUpdate,
					checking: pwaUpdateStore.checking,
					lastCheckedAt: pwaUpdateStore.lastCheckedAt,
					error: pwaUpdateStore.checkError,
					statusText: pwaUpdateStore.statusText,
				},
			},
			null,
			2,
		);
	}

	async function copyDiagnostics() {
		try {
			await navigator.clipboard.writeText(asDiagnosticJson());
			copyMessage = 'Diagnose kopiert.';
			trackFeatureEvent('app_status', 'copy_diagnostics');
		} catch {
			copyMessage = 'Kopieren ist in diesem Browser nicht verfügbar.';
		}
	}
</script>

<SeoHead {seo} />

<div class="page-stack">
	<section class="card p-5" aria-labelledby="app-status-heading">
		<div class="space-y-2">
			<p class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted">
				Diagnose
			</p>
			<h1 id="app-status-heading" class="font-display text-[2rem] font-semibold text-text-default">
				App-Status
			</h1>
			<p class="meta-text max-w-[55ch]">
				Diese Seite zeigt lokale Browser- und Service-Worker-Daten, damit Safari-, Lesezeichen- und PWA-Probleme reproduzierbar gemeldet werden können.
			</p>
		</div>

		<div class="mt-5 flex flex-wrap gap-3">
			<button class="btn-primary" type="button" onclick={refreshDiagnostics} disabled={loading}>
				{loading ? 'Aktualisiere…' : 'Diagnose aktualisieren'}
			</button>
			<button class="btn-secondary" type="button" onclick={checkForUpdates} disabled={pwaUpdateStore.checking}>
				{pwaUpdateStore.checking ? 'Prüfe…' : 'Update prüfen'}
			</button>
			<button class="btn-secondary" type="button" onclick={copyDiagnostics} disabled={!diagnostics}>
				Diagnose kopieren
			</button>
			<a class="btn-secondary" href={resolve('/recovery')}>App reparieren</a>
		</div>

		{#if checkMessage || copyMessage}
			<p class="meta-text mt-4" role="status" aria-live="polite">{checkMessage || copyMessage}</p>
		{/if}
	</section>

	<section class="card p-5">
		<h2 class="section-title">Update-Status</h2>
		<div class="mt-3 grid gap-3 sm:grid-cols-2">
			<div class="rounded-control border border-border-default bg-surface-subtle p-4">
				<p class="meta-text">Status</p>
				<p class="text-[1rem] font-semibold text-text-default">{pwaUpdateStore.statusText}</p>
			</div>
			<div class="rounded-control border border-border-default bg-surface-subtle p-4">
				<p class="meta-text">Prüfzustand</p>
				<p class="text-[1rem] font-semibold text-text-default">{pwaUpdateStore.checkState}</p>
			</div>
			<div class="rounded-control border border-border-default bg-surface-subtle p-4">
				<p class="meta-text">Update verfügbar</p>
				<p class="text-[1rem] font-semibold text-text-default">{pwaUpdateStore.hasUpdate ? 'ja' : 'nein'}</p>
			</div>
			<div class="rounded-control border border-border-default bg-surface-subtle p-4">
				<p class="meta-text">Letzte Prüfung</p>
				<p class="text-[1rem] font-semibold text-text-default">{pwaUpdateStore.lastCheckedAt ?? '—'}</p>
			</div>
		</div>
		{#if pwaUpdateStore.checkError}
			<p class="meta-text mt-3">Fehler: {pwaUpdateStore.checkError}</p>
		{/if}
	</section>

	{#if diagnostics}
		<section class="card p-5">
			<h2 class="section-title">Browser-Status</h2>
			<dl class="mt-3 grid gap-3 sm:grid-cols-2">
				<div class="rounded-control border border-border-default bg-surface-subtle p-4">
					<dt class="meta-text">App-Version</dt>
					<dd class="break-all font-semibold text-text-default">{diagnostics.appVersion}</dd>
				</div>
				<div class="rounded-control border border-border-default bg-surface-subtle p-4">
					<dt class="meta-text">Display Mode</dt>
					<dd class="font-semibold text-text-default">{diagnostics.displayMode}</dd>
				</div>
				<div class="rounded-control border border-border-default bg-surface-subtle p-4">
					<dt class="meta-text">Netzwerk</dt>
					<dd class="font-semibold text-text-default">{diagnostics.online ? 'online' : 'offline'}</dd>
				</div>
				<div class="rounded-control border border-border-default bg-surface-subtle p-4">
					<dt class="meta-text">Cache Storage</dt>
					<dd class="font-semibold text-text-default">{diagnostics.cacheStorageSupported ? 'verfügbar' : 'nicht verfügbar'}</dd>
				</div>
			</dl>
		</section>

		<section class="card p-5">
			<h2 class="section-title">Service Worker</h2>
			<dl class="mt-3 space-y-3 text-sm">
				<div>
					<dt class="font-medium text-text-default">Unterstützt</dt>
					<dd class="text-text-muted">{diagnostics.serviceWorker.supported ? 'ja' : 'nein'}</dd>
				</div>
				<div>
					<dt class="font-medium text-text-default">Controller</dt>
					<dd class="break-all text-text-muted">{diagnostics.serviceWorker.controller ?? '—'}</dd>
				</div>
				<div>
					<dt class="font-medium text-text-default">Scope</dt>
					<dd class="break-all text-text-muted">{diagnostics.serviceWorker.scope ?? '—'}</dd>
				</div>
				<div>
					<dt class="font-medium text-text-default">Active</dt>
					<dd class="break-all text-text-muted">{diagnostics.serviceWorker.active ?? '—'}</dd>
				</div>
				<div>
					<dt class="font-medium text-text-default">Waiting</dt>
					<dd class="break-all text-text-muted">{diagnostics.serviceWorker.waiting ?? '—'}</dd>
				</div>
			</dl>
		</section>

		<section class="card p-5">
			<h2 class="section-title">App-Caches</h2>
			{#if diagnostics.appCaches.length > 0}
				<ul class="mt-3 list-disc space-y-1 pl-5 text-sm text-text-muted">
					{#each diagnostics.appCaches as cacheName (cacheName)}
						<li class="break-all">{cacheName}</li>
					{/each}
				</ul>
			{:else}
				<p class="meta-text mt-3">Keine Caches mit Präfix <code>{APP_CACHE_PREFIX}</code> gefunden.</p>
			{/if}
		</section>

		<section class="card p-5">
			<h2 class="section-title">Adresse und Gerät</h2>
			<dl class="mt-3 space-y-3 text-sm">
				<div>
					<dt class="font-medium text-text-default">Aktuelle Adresse</dt>
					<dd class="break-all text-text-muted">{diagnostics.currentUrl}</dd>
				</div>
				<div>
					<dt class="font-medium text-text-default">User Agent</dt>
					<dd class="break-all text-text-muted">{diagnostics.userAgent}</dd>
				</div>
				<div>
					<dt class="font-medium text-text-default">Erfasst</dt>
					<dd class="break-all text-text-muted">{diagnostics.collectedAt}</dd>
				</div>
			</dl>
		</section>
	{:else}
		<section class="card p-5" role="status">
			<p class="meta-text">Diagnose wird geladen…</p>
		</section>
	{/if}
</div>
