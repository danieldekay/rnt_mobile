<script lang="ts">
	import { pwaInstallStore } from '$lib/stores/pwa-install.svelte';
	import { trackFeatureEvent } from '$lib/matomo';

	async function handleClick() {
		const hadPrompt = pwaInstallStore.canPromptNatively;
		trackFeatureEvent('pwa_install', hadPrompt ? 'native_prompt' : 'open_instructions');
		await pwaInstallStore.activate();
	}
</script>

{#if pwaInstallStore.buttonVisible}
	<button
		type="button"
		onclick={handleClick}
		disabled={pwaInstallStore.promptInFlight}
		class="inline-flex min-h-12 items-center gap-2 rounded-control border border-border-accent bg-action-primary px-3 py-2 text-sm font-semibold text-text-inverse transition-colors hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring/35 disabled:opacity-70"
		aria-label="App installieren - Anleitung anzeigen"
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
				d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
			/>
		</svg>
		<span class="hidden sm:inline">Installieren</span>
		<span class="sm:hidden">App</span>
	</button>
{/if}
