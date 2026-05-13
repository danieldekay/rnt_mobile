<script lang="ts">
	import {
		ENTITY_DATE_FILTER_OPTIONS,
		type DateFilterCounts,
		type EntityDateFilter
	} from '$lib/utils/date-filters';

	type Props = {
		value?: EntityDateFilter;
		counts?: Partial<DateFilterCounts>;
		label?: string;
	};

	let {
		value = $bindable<EntityDateFilter>('all'),
		counts = {},
		label = 'Zeitraum'
	}: Props = $props();

	function getCount(filter: EntityDateFilter): number {
		return counts[filter] ?? 0;
	}
</script>

<div class="flex flex-wrap gap-2 pt-3" role="group" aria-label={label}>
	{#each ENTITY_DATE_FILTER_OPTIONS as option (option.id)}
		<button
			type="button"
			onclick={() => (value = option.id)}
			aria-pressed={value === option.id}
			class="rounded-badge border px-4 py-2 text-[0.95rem] font-medium transition-colors inline-flex items-center gap-2 min-h-12 {value === option.id ? 'border-action-primary bg-action-primary text-text-inverse' : 'border-border-default bg-surface-card text-text-default hover:bg-action-secondary'}"
		>
			<span>{option.label}</span>
			<span class="rounded-full bg-current/15 px-1.5 py-0.5 text-[0.6875rem] font-semibold leading-none">
				{getCount(option.id)}
			</span>
		</button>
	{/each}
</div>
