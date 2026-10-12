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

<div
	class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 pt-2 sm:mx-0 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:px-0"
	role="group"
	aria-label={label}
>
	{#each ENTITY_DATE_FILTER_OPTIONS as option (option.id)}
		<button
			type="button"
			onclick={() => (value = option.id)}
			aria-pressed={value === option.id}
			class="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-badge border px-3 py-1.5 text-[0.875rem] font-medium transition-colors sm:min-h-11 sm:px-3.5 sm:text-[0.925rem] {value === option.id ? 'border-action-primary bg-action-primary text-text-inverse' : 'border-border-default bg-surface-card text-text-default hover:bg-action-secondary'}"
		>
			<span>{option.label}</span>
			<span class="rounded-full bg-current/15 px-1.5 py-0.5 text-[0.625rem] font-semibold leading-none sm:text-[0.6875rem]">
				{getCount(option.id)}
			</span>
		</button>
	{/each}
</div>
