<script lang="ts">
	import Heading from '$lib/components/Heading.svelte';
	import Text from '$lib/components/Text.svelte';

	let {
		title,
		description,
		actionLabel = 'Karte aktivieren',
		onEnable
	}: {
		title: string;
		description: string;
		actionLabel?: string;
		onEnable: () => void;
	} = $props();
</script>

<div class="consent-placeholder" role="note" aria-live="polite">
	<div class="space-y-2">
		<Heading level={3} size="xl" weight="semibold">{title}</Heading>
		<Text size="lg" color="muted" as="p" class="max-w-[40ch]">{description}</Text>
	</div>
	<button class="btn-secondary" type="button" onclick={onEnable}>
		{actionLabel}
	</button>
</div>