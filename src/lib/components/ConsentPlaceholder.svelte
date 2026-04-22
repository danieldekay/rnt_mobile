<script lang="ts">
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
		<p class="font-display text-[1.25rem] font-semibold text-text-default">{title}</p>
		<p class="meta-text max-w-[40ch]">{description}</p>
	</div>
	<button class="btn-secondary" type="button" onclick={onEnable}>
		{actionLabel}
	</button>
</div>