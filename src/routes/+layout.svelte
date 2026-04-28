<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { updated } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import PwaUpdateBanner from '$lib/components/PwaUpdateBanner.svelte';
	import PwaInstallButton from '$lib/components/PwaInstallButton.svelte';
	import PwaInstallModal from '$lib/components/PwaInstallModal.svelte';
	import { syncMatomoConsent, trackFeatureEvent } from '$lib/matomo';
	import { consentStore } from '$lib/stores/consent.svelte';
	import { pwaUpdateStore } from '$lib/stores/pwa-update.svelte';
	import { pwaInstallStore } from '$lib/stores/pwa-install.svelte';

	let { children } = $props();

	let stagedAnalytics = $state(false);
	let stagedMaps = $state(false);
	const currentYear = new Date().getFullYear();

	$effect(() => {
		if (consentStore.settingsOpen) {
			stagedAnalytics = consentStore.preferences.analytics;
			stagedMaps = consentStore.preferences.maps;
		}
	});

	$effect(() => {
		pwaUpdateStore.syncFromKit(updated.current);
	});

	onMount(() => {
		pwaInstallStore.start();
		return () => pwaInstallStore.stop();
	});

	$effect(() => {
		syncMatomoConsent(consentStore.hasConsent('analytics'));
	});

	afterNavigate((navigation) => {
		if (!navigation.to) return;
		if (!consentStore.hasConsent('analytics')) return;
		syncMatomoConsent(
			true,
			`${navigation.to.url.pathname}${navigation.to.url.search}`,
			document.title
		);
	});

	function openConsentSettings() {
		consentStore.openSettings();
	}

	function saveConsentPreferences() {
		consentStore.savePreferences({
			analytics: stagedAnalytics,
			maps: stagedMaps
		});
		trackFeatureEvent('consent', 'save_preferences');
	}

	function acceptAllConsent() {
		consentStore.acceptAll();
		trackFeatureEvent('consent', 'accept_all');
	}

	function rejectOptionalConsent() {
		consentStore.rejectOptional();
		trackFeatureEvent('consent', 'reject_optional');
	}

	async function checkForAppUpdate() {
		await pwaUpdateStore.checkForUpdate(() => updated.check());
	}

	function applyAppUpdate() {
		pwaUpdateStore.applyUpdate();
	}

	function toggleUpdateRecovery() {
		pwaUpdateStore.toggleRecovery();
	}
</script>

<a class="skip-link" href="#main-content">Zum Inhalt springen</a>

<PwaInstallModal />

{#if consentStore.shouldShowBanner}
	<div class="fixed bottom-4 left-4 right-4 z-50 md:left-1/2 md:w-full md:max-w-xl md:-translate-x-1/2">
		<div class="consent-panel p-5">
			<div class="space-y-3">
				<div class="space-y-1">
					<p class="font-display text-[1.5rem] font-semibold text-text-default">Datenschutz und Einwilligung</p>
					<p class="meta-text">Essenzielle Speicherung bleibt aktiv. Analytik und eingebettete Karten werden erst nach deiner Zustimmung aktiviert.</p>
				</div>
				<div class="flex flex-wrap gap-3">
					<button class="btn-secondary" type="button" onclick={rejectOptionalConsent}>
						Nur notwendige
					</button>
					<button class="btn-secondary" type="button" onclick={openConsentSettings}>
						Auswaehlen
					</button>
					<button class="btn-primary" type="button" onclick={acceptAllConsent}>
						Alle akzeptieren
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

{#if consentStore.settingsOpen}
	<div class="fixed inset-0 z-[60] bg-surface-strong/45 px-4 py-6 backdrop-blur-sm">
		<div class="mx-auto max-w-xl">
			<div class="consent-panel p-5" role="dialog" aria-modal="true" aria-labelledby="consent-settings-title">
				<div class="flex items-start justify-between gap-4">
					<div class="space-y-1">
						<h2 id="consent-settings-title" class="font-display text-[1.75rem] font-semibold text-text-default">Einwilligung verwalten</h2>
						<p class="meta-text">Du kannst Analytik und Karten getrennt steuern. Essenzielle Speicherung bleibt fuer Navigation und deine Auswahl aktiv.</p>
					</div>
					<button
						onclick={() => consentStore.closeSettings()}
						class="rounded-badge p-2 text-text-muted transition-colors hover:bg-action-secondary hover:text-text-default"
						aria-label="Einwilligungsdialog schliessen"
						type="button"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
						</svg>
					</button>
				</div>

				<div class="mt-5 space-y-3">
					<div class="rounded-control border border-border-default bg-surface-subtle p-4">
						<div class="flex items-start justify-between gap-4">
							<div>
								<p class="text-[1rem] font-semibold text-text-default">Essenziell</p>
								<p class="meta-text">Notwendig fuer App-Navigation, lokale Einwilligung und die Grundfunktionen des Kalenders.</p>
							</div>
							<span class="inline-flex min-h-10 items-center rounded-badge border border-border-default bg-surface-card px-3 py-1 text-sm font-medium text-text-default">Immer aktiv</span>
						</div>
					</div>
					<label class="flex items-start justify-between gap-4 rounded-control border border-border-default bg-surface-card p-4">
						<div>
							<p class="text-[1rem] font-semibold text-text-default">Analytik mit Matomo</p>
							<p class="meta-text">Misst Routen, App-Version und Funktionsnutzung erst nach ausdruecklicher Zustimmung.</p>
						</div>
						<input bind:checked={stagedAnalytics} class="mt-1 h-5 w-5 accent-action-primary" type="checkbox" />
					</label>
					<label class="flex items-start justify-between gap-4 rounded-control border border-border-default bg-surface-card p-4">
						<div>
							<p class="text-[1rem] font-semibold text-text-default">Eingebettete Karten</p>
							<p class="meta-text">Laedt erst dann externe OpenStreetMap-Kacheln fuer Listen- und Veranstaltungsansichten.</p>
						</div>
						<input bind:checked={stagedMaps} class="mt-1 h-5 w-5 accent-action-primary" type="checkbox" />
					</label>
				</div>

				<div class="mt-5 flex flex-wrap gap-3">
					<button class="btn-secondary" type="button" onclick={rejectOptionalConsent}>
						Nur notwendige
					</button>
					<button class="btn-primary" type="button" onclick={saveConsentPreferences}>
						Auswahl speichern
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<div class="min-h-screen flex flex-col">
	<!-- Header -->
	<header class="sticky top-0 z-50 border-b border-border-default bg-surface-canvas/95 backdrop-blur-sm">
		<div class="mx-auto max-w-xl px-4 py-4 md:px-5">
			<div class="flex items-center justify-between gap-4">
				<div class="flex items-center gap-3">
					<div class="flex h-11 w-11 items-center justify-center overflow-hidden rounded-card border border-border-default bg-surface-card shadow-card">
						<img
							src="/rnt-logo.png"
							alt=""
							class="h-full w-full object-contain"
							loading="eager"
							decoding="async"
						/>
					</div>
					<div>
						<h1 class="font-display text-[1.25rem] font-semibold text-text-default">RNT Kalender</h1>
						<p class="text-sm text-text-muted">Rhein-Neckar-Tango</p>
					</div>
				</div>
				
				<nav class="flex items-center gap-2" aria-label="Hauptnavigation">
					<a href={resolve('/')} class="inline-flex min-h-12 items-center gap-2 rounded-control border px-3 py-2 text-sm font-medium transition-colors {$page.url.pathname === '/' ? 'border-border-accent bg-action-secondary text-text-default' : 'border-transparent text-text-muted hover:border-border-default hover:bg-surface-card hover:text-text-default'}">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
						</svg>
						<span>Liste</span>
					</a>
					<a href={resolve('/calendar')} class="inline-flex min-h-12 items-center gap-2 rounded-control border px-3 py-2 text-sm font-medium transition-colors {$page.url.pathname.startsWith('/calendar') ? 'border-border-accent bg-action-secondary text-text-default' : 'border-transparent text-text-muted hover:border-border-default hover:bg-surface-card hover:text-text-default'}">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
						</svg>
						<span>Kalender</span>
					</a>
					<PwaInstallButton />
				</nav>
			</div>
		</div>
	</header>

	{#if pwaUpdateStore.hasUpdate || pwaUpdateStore.checkState === 'error'}
		<div class="mx-auto w-full max-w-xl px-4 pt-5 md:px-5">
			<PwaUpdateBanner
				hasUpdate={pwaUpdateStore.hasUpdate}
				checking={pwaUpdateStore.checking}
				checkError={pwaUpdateStore.checkError}
				recoveryOpen={pwaUpdateStore.recoveryOpen}
				onApply={applyAppUpdate}
				onToggleRecovery={toggleUpdateRecovery}
				onManualCheck={checkForAppUpdate}
			/>
		</div>
	{/if}

	<!-- Main content -->
	<main id="main-content" class="mx-auto flex-1 w-full max-w-xl px-4 py-5 md:px-5" tabindex="-1">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="mt-auto border-t border-border-default py-5">
		<div class="mx-auto max-w-xl space-y-2 px-4 text-center md:px-5">
			<p class="meta-text flex flex-wrap justify-center gap-x-4 gap-y-2">
				<a href={resolve('/impressum')} class="underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default">
					Impressum
				</a>
				<a href={resolve('/datenschutz')} class="underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default">
					Datenschutz
				</a>
				<a href={resolve('/cookie-richtlinie')} class="underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default">
					Cookie-Richtlinie
				</a>
				<button type="button" class="underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default" onclick={openConsentSettings}>
					Einwilligung verwalten
				</button>
			</p>
			<p class="meta-text">
				Feedback oder Ideen:
				<a href="https://github.com/danieldekay/rnt_mobile/issues" target="_blank" rel="noopener noreferrer" class="underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default">
					GitHub Issues
				</a>
			</p>
			<p class="meta-text">
				<a href="https://www.rhein-neckar-tango.de" target="_blank" rel="noopener noreferrer" class="underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default">
					rhein-neckar-tango.de
				</a>
			</p>
			<p class="meta-text">© {currentYear} Rhein-Neckar-Tango</p>
			<div class="space-y-2">
				<p class="meta-text">App-Version {__APP_VERSION__}</p>
				<p class="meta-text">{pwaUpdateStore.statusText}</p>
				<p class="meta-text flex flex-wrap justify-center gap-x-4 gap-y-2">
					<button
						type="button"
						class="underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default disabled:no-underline disabled:opacity-60"
						onclick={checkForAppUpdate}
						disabled={pwaUpdateStore.checking}
					>
						{pwaUpdateStore.checking ? 'Prüfe auf Updates…' : 'Jetzt auf Updates prüfen'}
					</button>
					<button
						type="button"
						class="underline decoration-border-default underline-offset-4 transition-colors hover:text-text-default"
						onclick={toggleUpdateRecovery}
					>
						Aktualisierungshilfe
					</button>
				</p>
				{#if pwaUpdateStore.recoveryOpen && !pwaUpdateStore.hasUpdate}
					<p class="meta-text max-w-[42ch] mx-auto">
						Wenn die installierte App nach einem Deployment noch alt aussieht, schließe sie kurz komplett, öffne sie neu und lade die Seite bei Bedarf einmal direkt im Browser.
					</p>
				{/if}
			</div>
		</div>
	</footer>
</div>
