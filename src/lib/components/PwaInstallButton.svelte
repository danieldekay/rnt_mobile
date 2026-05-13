<script lang="ts">
	import { pwaInstallStore } from '$lib/stores/pwa-install.svelte';
	import { trackFeatureEvent } from '$lib/matomo';
	import Button from '$lib/components/Button.svelte';

	async function handleClick() {
		const hadPrompt = pwaInstallStore.canPromptNatively;
		trackFeatureEvent('pwa_install', hadPrompt ? 'native_prompt' : 'open_instructions');
		await pwaInstallStore.activate();
	}
</script>

{#if pwaInstallStore.buttonVisible}
	<Button
		variant="primary"
		size="md"
		onclick={handleClick}
		disabled={pwaInstallStore.promptInFlight}
		leftIcon="↓"
		ariaLabel="App installieren - Anleitung anzeigen"
	>
		<span class="hidden sm:inline">Installieren</span>
		<span class="sm:hidden">App</span>
	</Button>
{/if}
