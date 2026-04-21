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

<div class="flex gap-1 p-1 bg-gray-100 rounded-xl">
	{#each options as option}
		<button
			onclick={() => onchange(option.value)}
			class="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 {active === option.value ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'}"
		>
			{option.label}
		</button>
	{/each}
</div>
