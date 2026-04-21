<script lang="ts">
	import '../app.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { on } from 'svelte/events';

	let { children } = $props();

	let deferredPrompt = $state<Event | null>(null);
	let isInstallable = $state(false);
	let showBanner = $state(false);
	let isIOS = $state(false);

	$effect(() => {
		const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
		const dismissed = localStorage.getItem('pwa-install-dismissed');
		if (isStandalone || dismissed) return;

		isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(navigator as any).standalone;

		const handler = (e: Event) => {
			e.preventDefault();
			deferredPrompt = e;
			isInstallable = true;
			showBanner = true;
		};

		const offBeforeInstallPrompt = on(window, 'beforeinstallprompt', handler);
		
		if (!isIOS && !isInstallable) {
			setTimeout(() => { showBanner = true; }, 2000);
		} else if (isIOS) {
			showBanner = true;
		}

		return () => offBeforeInstallPrompt();
	});

	async function install() {
		if (!deferredPrompt) return;
		const prompt = deferredPrompt as any;
		prompt.prompt();
		const { outcome } = await prompt.userChoice;
		if (outcome === 'accepted') {
			showBanner = false;
			deferredPrompt = null;
		}
	}

	function dismiss() {
		localStorage.setItem('pwa-install-dismissed', 'true');
		showBanner = false;
	}
</script>

<a class="skip-link" href="#main-content">Zum Inhalt springen</a>

{#if showBanner}
	<div class="fixed bottom-20 left-4 right-4 z-40 md:left-1/2 md:w-full md:max-w-lg md:-translate-x-1/2" role="status" aria-live="polite">
		<div class="card relative p-4">
			<button
				onclick={dismiss}
				class="absolute right-3 top-3 rounded-badge p-2 text-text-muted transition-colors hover:bg-action-secondary hover:text-text-default"
				aria-label="Schließen"
				type="button"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
				</svg>
			</button>

			{#if isIOS}
				<div class="space-y-3 text-left pr-8">
					<p class="font-display text-xl font-semibold text-text-default">App installieren</p>
					<p class="meta-text">
						Teilen button → <span class="font-medium">"Zum Homebildschirm"</span>
					</p>
					<div class="flex flex-wrap items-center gap-2 text-sm text-text-muted">
						<span>1. Tippe auf</span>
						<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 3c1.1 0 2 .9 2 2v3h2V5c0-1.1-.9-2-2-2H9zM6 9h12v8H6V9z"/></svg>
						<span>2. Wähle</span>
						<span class="font-medium text-text-default">Zum Homebildschirm</span>
					</div>
				</div>
			{:else}
				<button
					onclick={install}
					class="btn-primary w-full gap-2"
					type="button"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
					</svg>
					App installieren
				</button>
				<p class="meta-text mt-2 text-center">
					Offline nutzen &amp; zum Homebildschirm hinzufügen
				</p>
			{/if}
		</div>
	</div>
{/if}

<div class="min-h-screen flex flex-col">
	<!-- Header -->
	<header class="sticky top-0 z-50 border-b border-border-default bg-surface-canvas/95 backdrop-blur-sm">
		<div class="mx-auto max-w-xl px-4 py-4 md:px-5">
			<div class="flex items-center justify-between gap-4">
				<div class="flex items-center gap-3">
					<div class="flex h-11 w-11 items-center justify-center rounded-card border border-border-accent bg-action-primary text-text-inverse shadow-card">
						<span class="font-display text-lg font-semibold">R</span>
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
				</nav>
			</div>
		</div>
	</header>

	<!-- Main content -->
	<main id="main-content" class="mx-auto flex-1 w-full max-w-xl px-4 py-5 md:px-5" tabindex="-1">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="mt-auto border-t border-border-default py-5">
		<div class="mx-auto max-w-xl space-y-2 px-4 text-center md:px-5">
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
		</div>
	</footer>
</div>
