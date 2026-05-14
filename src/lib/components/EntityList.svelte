<script lang="ts">
	import DateFilterChips from "$lib/components/DateFilterChips.svelte";
	import SkeletonCard from "$lib/components/SkeletonCard.svelte";
	import type { EntityDateFilter, DateFilterCounts } from "$lib/types";

	type EntityListProps = {
		searchQuery?: string;
		searchPlaceholder?: string;
		onReset?: () => void;
		hasActiveFilters?: boolean;
		visibleCount?: number;
		totalCount?: number;
		activeDateFilter?: EntityDateFilter;
		onDateFilterChange?: (filter: EntityDateFilter) => void;
		dateFilterCounts?: DateFilterCounts;
		showLoading?: boolean;
		loadError?: boolean;
		entityType?: string;
	};

	let {
		searchQuery = $bindable(""),
		searchPlaceholder = "Suche",
		onReset,
		hasActiveFilters = false,
		visibleCount = 0,
		totalCount = 0,
		activeDateFilter = $bindable("current-month"),
		onDateFilterChange,
		dateFilterCounts = {
			all: 0,
			"next-7-days": 0,
			"current-month": 0,
			"next-3-months": 0,
		} as DateFilterCounts,
		showLoading = false,
		loadError = false,
		entityType = "",
	}: EntityListProps = $props();
</script>

{#if showLoading}
	<div class="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4" role="status" aria-live="polite">
		{#each Array.from({ length: 6 }) as _, index (index)}
			<SkeletonCard variant="avatar-list" imageShape="circle" imageSize="avatar" lines={1} />
		{/each}
	</div>
{:else if loadError}
	<section class="card space-y-2 p-6 text-center" role="alert">
		<p class="text-[1rem] font-semibold text-text-default">
			{entityType} konnten nicht geladen werden
		</p>
		<p class="meta-text">Bitte versuche es später erneut.</p>
	</section>
{:else if visibleCount === 0 && totalCount === 0}
	<section class="card space-y-2 p-6 text-center">
		<p class="text-[1rem] font-semibold text-text-default">
			Keine {entityType} in diesem Zeitraum
		</p>
		<p class="meta-text">Wähle einen anderen Zeitraum, um weitere {entityType} zu sehen.</p>
	</section>
{:else if visibleCount === 0}
	<section class="card space-y-2 p-6 text-center">
		<p class="text-[1rem] font-semibold text-text-default">
			Keine {entityType} für diese Auswahl
		</p>
		<p class="meta-text">Passe Suche oder Filter an, um weitere {entityType} zu sehen.</p>
	</section>
{:else}
	<section class="card space-y-4 p-4">
		<div class="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_auto] lg:items-end">
			<label class="block min-w-0">
				<span class="mb-1.5 block text-sm font-medium text-text-default">Suche</span>
				<input
					type="search"
					bind:value={searchQuery}
					placeholder={searchPlaceholder}
					class="min-h-12 w-full rounded-control border border-border-default bg-surface-card px-4 py-2 text-[0.95rem] text-text-default outline-none transition-colors placeholder:text-text-muted focus:border-action-primary"
				/>
			</label>
			{#if onReset}
				<button
					type="button"
					onclick={onReset}
					disabled={!hasActiveFilters}
					class="inline-flex min-h-12 items-center justify-center rounded-control border border-border-default bg-surface-subtle px-4 py-2 text-[0.95rem] font-medium text-text-default transition-colors enabled:hover:bg-action-secondary disabled:cursor-not-allowed disabled:opacity-55"
				>
					Zurücksetzen
				</button>
			{/if}
		</div>
		{#if onDateFilterChange}
			<DateFilterChips bind:value={activeDateFilter} counts={dateFilterCounts} />
		{/if}
		<div class="flex flex-col gap-1 border-t border-border-default pt-3 lg:flex-row lg:items-center lg:justify-between">
			<p class="text-sm font-medium text-text-default">
				{visibleCount} von {totalCount} {entityType} sichtbar
			</p>
		</div>
	</section>
{/if}
