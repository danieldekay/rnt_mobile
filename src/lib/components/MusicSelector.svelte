<script lang="ts">
	import type { MusicType } from '$lib/types';

	interface Props {
		active: MusicType | null;
		onchange: (filter: MusicType | null) => void;
	}

	let { active, onchange }: Props = $props();

	const options: { value: MusicType | null; label: string }[] = [
		{ value: null, label: 'Alle' },
		{ value: 'traditional', label: 'Traditional' },
		{ value: 'mixed', label: 'Mixed' },
		{ value: 'neo', label: 'Neo' }
	];
</script>

<div class="grid grid-cols-4 gap-2 rounded-card border border-border-default bg-surface-subtle p-2">
	{#each options as option (option.value ?? 'all')}
		<button
			onclick={() => onchange(option.value)}
			class="inline-flex min-h-12 items-center justify-center rounded-control border px-2 py-2 text-[0.8125rem] sm:text-sm font-medium transition-colors {active === option.value ? 'border-border-accent bg-surface-card text-text-default shadow-card' : 'border-transparent bg-transparent text-text-muted hover:border-border-default hover:bg-surface-card hover:text-text-default'}"
			aria-pressed={active === option.value}
		>
			{option.label}
		</button>
	{/each}
</div>