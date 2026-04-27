<script lang="ts">
	import { pwaInstallStore, type InstallPlatform } from '$lib/stores/pwa-install.svelte';
	import { trackFeatureEvent } from '$lib/matomo';
	import { on } from 'svelte/events';

	type Step = {
		text: string;
		icon?: 'share-ios' | 'share-android' | 'menu-vertical' | 'menu-horizontal' | 'plus' | 'home';
	};

	type Instructions = {
		title: string;
		intro: string;
		steps: Step[];
		note?: string;
		copyLink?: boolean;
	};

	const INSTRUCTIONS: Record<InstallPlatform, Instructions> = {
		'chromium-prompt': {
			title: 'App installieren',
			intro: 'Dein Browser kann die App direkt installieren.',
			steps: [
				{ text: 'Tippe unten auf "Jetzt installieren".' },
				{ text: 'Bestätige die Installation im Dialog.' }
			]
		},
		'ios-safari': {
			title: 'Auf dem iPhone/iPad installieren',
			intro: 'Safari kann diese Seite wie eine App zum Home-Bildschirm hinzufügen.',
			steps: [
				{
					text: 'Tippe unten in Safari auf das Teilen-Symbol.',
					icon: 'share-ios'
				},
				{
					text: 'Scrolle nach unten und wähle "Zum Home-Bildschirm".',
					icon: 'plus'
				},
				{
					text: 'Tippe oben rechts auf "Hinzufügen".',
					icon: 'home'
				}
			],
			note: 'Die App öffnet sich danach wie eine normale App vom Home-Bildschirm.'
		},
		'ios-other': {
			title: 'Installation nur in Safari möglich',
			intro: 'Auf dem iPhone können Apps nur über Safari installiert werden - nicht über Firefox oder Chrome.',
			steps: [
				{ text: 'Öffne diese Seite in Safari.' },
				{
					text: 'Tippe in Safari auf das Teilen-Symbol.',
					icon: 'share-ios'
				},
				{
					text: 'Wähle "Zum Home-Bildschirm".',
					icon: 'plus'
				}
			],
			copyLink: true
		},
		'android-firefox': {
			title: 'Auf Android mit Firefox installieren',
			intro: 'Firefox kann diese Seite als App zum Home-Bildschirm hinzufügen.',
			steps: [
				{
					text: 'Tippe rechts oben auf das Menü (drei Punkte).',
					icon: 'menu-vertical'
				},
				{ text: 'Wähle "Installieren" oder "Zum Startbildschirm hinzufügen".' },
				{ text: 'Bestätige mit "Hinzufügen".' }
			]
		},
		'android-samsung': {
			title: 'Im Samsung Internet Browser installieren',
			intro: 'Der Samsung Internet Browser kann diese Seite als App hinzufügen.',
			steps: [
				{
					text: 'Tippe unten auf das Menü (drei Striche).',
					icon: 'menu-horizontal'
				},
				{ text: 'Wähle "Seite hinzufügen zu" → "Startbildschirm".' },
				{ text: 'Bestätige mit "Hinzufügen".' }
			]
		},
		'android-generic': {
			title: 'Auf Android installieren',
			intro: 'Die meisten Android-Browser können diese Seite als App hinzufügen.',
			steps: [
				{
					text: 'Tippe rechts oben auf das Menü (drei Punkte).',
					icon: 'menu-vertical'
				},
				{
					text: 'Wähle "App installieren" oder "Zum Startbildschirm hinzufügen".'
				},
				{ text: 'Bestätige mit "Installieren" oder "Hinzufügen".' }
			],
			note: 'Findest du den Menüpunkt nicht? Öffne diese Seite in Chrome - dort klappt es am zuverlässigsten.'
		},
		'desktop-chromium': {
			title: 'Am Computer installieren',
			intro: 'Chrome, Edge und Brave können die App wie ein Programm installieren.',
			steps: [
				{
					text: 'Klicke rechts in der Adresszeile auf das Installations-Symbol (Monitor mit Pfeil nach unten).'
				},
				{ text: 'Falls es nicht sichtbar ist: Menü (drei Punkte) → "App installieren".' },
				{ text: 'Bestätige mit "Installieren".' }
			],
			note: 'Die App erscheint danach wie ein normales Programm im Startmenü oder Dock.'
		},
		'desktop-safari': {
			title: 'Auf dem Mac mit Safari installieren',
			intro: 'Safari ab macOS 14 (Sonoma) kann diese Seite zum Dock hinzufügen.',
			steps: [
				{
					text: 'Klicke oben in der Menüleiste auf "Ablage".'
				},
				{ text: 'Wähle "Zum Dock hinzufügen…".' },
				{ text: 'Bestätige mit "Hinzufügen".' }
			],
			note: 'Bei älteren macOS-Versionen funktioniert das nicht - dann am besten Chrome verwenden.'
		},
		'desktop-firefox': {
			title: 'Firefox unterstützt keine PWA-Installation',
			intro: 'Firefox am Computer kann Web-Apps leider nicht direkt installieren.',
			steps: [
				{
					text: 'Öffne diese Seite in Chrome, Edge oder Brave, um die App zu installieren.'
				},
				{
					text: 'Alternativ: Lege ein Lesezeichen an (Strg+D) für schnellen Zugriff.'
				}
			],
			copyLink: true
		},
		unknown: {
			title: 'App installieren',
			intro:
				'Dein Browser wurde nicht erkannt. So installierst du die App in den meisten Browsern:',
			steps: [
				{ text: 'Öffne das Browser-Menü (meist drei Punkte oder Striche).' },
				{
					text: 'Suche nach "Installieren", "App installieren" oder "Zum Startbildschirm hinzufügen".'
				},
				{ text: 'Bestätige die Installation.' }
			],
			copyLink: true
		}
	};

	let copied = $state(false);
	let dialogEl = $state<HTMLDivElement | null>(null);

	let content = $derived(INSTRUCTIONS[pwaInstallStore.platform]);

	async function close() {
		pwaInstallStore.closeModal();
	}

	async function handleNativeInstall() {
		trackFeatureEvent('pwa_install', 'native_prompt_from_modal');
		await pwaInstallStore.triggerNativePrompt();
	}

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(window.location.href);
			copied = true;
			trackFeatureEvent('pwa_install', 'copy_link');
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			copied = false;
		}
	}

	$effect(() => {
		if (!pwaInstallStore.modalOpen) return;

		const offKey = on(window, 'keydown', (event) => {
			if (event.key === 'Escape') close();
		});

		const previousFocus = document.activeElement as HTMLElement | null;
		queueMicrotask(() => dialogEl?.focus());

		return () => {
			offKey();
			previousFocus?.focus?.();
		};
	});
</script>

{#if pwaInstallStore.modalOpen}
	<div
		class="fixed inset-0 z-[70] flex items-end justify-center bg-surface-strong/55 px-0 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
		role="presentation"
		onclick={(e) => {
			if (e.target === e.currentTarget) close();
		}}
		onkeydown={() => {}}
	>
		<div
			bind:this={dialogEl}
			role="dialog"
			aria-modal="true"
			aria-labelledby="pwa-install-title"
			tabindex="-1"
			class="card w-full max-w-xl rounded-t-card rounded-b-none p-5 sm:rounded-card"
		>
			<div class="flex items-start justify-between gap-4">
				<div class="space-y-1">
					<h2
						id="pwa-install-title"
						class="font-display text-[1.5rem] font-semibold text-text-default"
					>
						{content.title}
					</h2>
					<p class="meta-text">{content.intro}</p>
				</div>
				<button
					onclick={close}
					class="rounded-badge p-2 text-text-muted transition-colors hover:bg-action-secondary hover:text-text-default"
					aria-label="Dialog schließen"
					type="button"
				>
					<svg
						class="h-5 w-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<ol class="mt-5 space-y-3">
				{#each content.steps as step, index (index)}
					<li
						class="flex items-start gap-3 rounded-control border border-border-default bg-surface-subtle p-3"
					>
						<span
							class="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-badge bg-action-primary text-sm font-bold text-text-inverse"
							aria-hidden="true"
						>
							{index + 1}
						</span>
						<div class="flex-1 space-y-1">
							<p class="text-[1rem] text-text-default">{step.text}</p>
							{#if step.icon === 'share-ios'}
								<svg
									class="h-8 w-8 text-action-primary"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										d="M12 2.5a1 1 0 0 1 .7.29l3.5 3.5a1 1 0 0 1-1.4 1.42L13 5.91V14a1 1 0 1 1-2 0V5.91L9.2 7.71a1 1 0 1 1-1.4-1.42l3.5-3.5A1 1 0 0 1 12 2.5zM5 11a2 2 0 0 1 2-2h1a1 1 0 1 1 0 2H7v9h10v-9h-1a1 1 0 1 1 0-2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9z"
									/>
								</svg>
							{:else if step.icon === 'share-android'}
								<svg
									class="h-8 w-8 text-action-primary"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 1 0-3-3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9a3 3 0 1 0 0 6c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 1 0 2.92-2.92z"
									/>
								</svg>
							{:else if step.icon === 'menu-vertical'}
								<svg
									class="h-8 w-8 text-action-primary"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
								>
									<circle cx="12" cy="6" r="1.75" />
									<circle cx="12" cy="12" r="1.75" />
									<circle cx="12" cy="18" r="1.75" />
								</svg>
							{:else if step.icon === 'menu-horizontal'}
								<svg
									class="h-8 w-8 text-action-primary"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
									stroke-linecap="round"
									aria-hidden="true"
								>
									<path d="M4 7h16M4 12h16M4 17h16" />
								</svg>
							{:else if step.icon === 'plus'}
								<svg
									class="h-8 w-8 text-action-primary"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									aria-hidden="true"
								>
									<rect x="3" y="3" width="18" height="18" rx="3" />
									<path stroke-linecap="round" d="M12 8v8M8 12h8" />
								</svg>
							{:else if step.icon === 'home'}
								<svg
									class="h-8 w-8 text-action-primary"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
								>
									<path d="M3 12l9-9 9 9" />
									<path d="M5 10v10h14V10" />
								</svg>
							{/if}
						</div>
					</li>
				{/each}
			</ol>

			{#if content.note}
				<p class="meta-text mt-4">{content.note}</p>
			{/if}

			<div class="mt-5 flex flex-wrap gap-3">
				{#if pwaInstallStore.canPromptNatively}
					<button
						class="btn-primary flex-1"
						type="button"
						onclick={handleNativeInstall}
						disabled={pwaInstallStore.promptInFlight}
					>
						{pwaInstallStore.promptInFlight ? 'Wird installiert…' : 'Jetzt installieren'}
					</button>
				{/if}

				{#if content.copyLink}
					<button class="btn-secondary flex-1" type="button" onclick={copyLink}>
						{copied ? '✓ Link kopiert' : 'Link zum Teilen kopieren'}
					</button>
				{/if}

				<button
					class="btn-secondary"
					type="button"
					onclick={close}
				>
					Schließen
				</button>
			</div>
		</div>
	</div>
{/if}
