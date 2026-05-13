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

<div class="flex flex-wrap gap-2">
	{#each options as option (option.value)}
		<button
			type="button"
			onclick={() => onchange(option.value)}
			class="rounded-badge border px-4 py-2 text-[0.95rem] font-medium transition-colors flex-1 inline-flex items-center justify-center min-h-12 {active === option.value ? 'border-action-primary bg-action-primary text-text-inverse shadow-card' : 'border-border-default bg-surface-card text-text-default hover:bg-action-secondary'}"
			aria-pressed={active === option.value}
		>
			{option.label}
		</button>
	{/each}
</div>
