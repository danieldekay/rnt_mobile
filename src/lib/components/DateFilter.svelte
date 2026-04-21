<script lang="ts">
	import type { DateFilter } from '$lib/types';

	interface Props {
		active: DateFilter;
		onchange: (filter: DateFilter) => void;
	}

	let { active, onchange }: Props = $props();

	const options: { value: DateFilter; label: string }[] = [
		{ value: 'today', label: 'Heute' },
		{ value: 'week', label: '7 Tage' },
		{ value: 'month', label: 'Monat' },
		{ value: 'all', label: 'Alle' }
	];
</script>

<div class="grid grid-cols-4 gap-2 rounded-card border border-border-default bg-surface-subtle p-2">
	{#each options as option (option.value)}
		<button
			onclick={() => onchange(option.value)}
			class="inline-flex min-h-12 items-center justify-center rounded-control border px-3 py-2 text-sm font-medium transition-colors {active === option.value ? 'border-border-accent bg-surface-card text-text-default shadow-card' : 'border-transparent bg-transparent text-text-muted hover:border-border-default hover:bg-surface-card hover:text-text-default'}"
			aria-pressed={active === option.value}
		>
			{option.label}
		</button>
	{/each}
</div>
