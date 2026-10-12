<script lang="ts">
    import DateFilterChips from "$lib/components/DateFilterChips.svelte";
    import { getDateFilterLabel } from "$lib/utils/date-filters";
    import type { EntityDateFilter, DjStyleKey } from "$lib/types";

    let {
        searchQuery,
        activeDateFilter = $bindable<EntityDateFilter>("current-month"),
        activeStyle,
        dateFilterCounts,
        styleOptions,
        styleCounts,
        visibleCount,
        totalCount,
        hasActiveFilters,
        onSearchChange,
        onResetFilters,
        onToggleStyle,
        getStyleLabel,
    }: {
        getStyleLabel: (style: DjStyleKey | null) => string;
        searchQuery: string;
        activeDateFilter: EntityDateFilter;
        activeStyle: string | null;
        dateFilterCounts: Record<string, number>;
        styleOptions: { id: string; label: string }[];
        styleCounts: Record<string, number>;
        visibleCount: number;
        totalCount: number;
        hasActiveFilters: boolean;
        onSearchChange: (value: string) => void;
        onResetFilters: () => void;
        onToggleStyle: (style: string | null) => void;
    } = $props();

    function handleSearchInput(event: Event) {
        const input = event.target as HTMLInputElement;
        onSearchChange(input.value);
    }
</script>

<section class="card space-y-4 p-3 sm:p-4">
    <div class="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_auto] lg:items-end">
        <label class="block min-w-0">
            <span class="mb-1.5 block text-sm font-medium text-text-default"
                >Suche</span
            >
            <input
                type="search"
                value={searchQuery}
                oninput={handleSearchInput}
                placeholder="Nach DJ-Name oder nächstem Termin suchen"
                class="min-h-11 w-full field-input sm:min-h-12"
            />
        </label>

        <button
            type="button"
            onclick={onResetFilters}
            disabled={!hasActiveFilters}
            class="inline-flex min-h-11 items-center justify-center rounded-control border border-border-default bg-surface-subtle px-3 py-2 text-[0.9rem] font-medium text-text-default transition-colors enabled:hover:bg-action-secondary disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-12 sm:px-4 sm:text-[0.95rem]"
        >
            Zurücksetzen
        </button>
    </div>

    <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-4">
        <div class="rounded-control border border-border-default/70 bg-surface-subtle/60 p-3">
            <p class="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-text-muted">
                Zeitraum
            </p>
            <DateFilterChips
                bind:value={activeDateFilter}
                counts={dateFilterCounts}
            />
        </div>

        <div class="rounded-control border border-border-default/70 bg-surface-subtle/60 p-3">
            <p class="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-text-muted">
                Musikprofil
            </p>
            <div class="-mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:px-0">
                <button
                    type="button"
                    onclick={() => onToggleStyle(null)}
                    aria-pressed={activeStyle === null}
                    class={`inline-flex min-h-10 shrink-0 items-center rounded-badge border px-3 py-1.5 text-[0.875rem] font-medium transition-colors sm:min-h-11 sm:px-3.5 sm:text-[0.925rem] ${
                        activeStyle === null
                            ? "border-action-primary bg-action-primary text-text-inverse"
                            : "border-border-default bg-surface-card text-text-default hover:bg-action-secondary"
                    }`}
                >
                    Alle
                </button>
                {#each styleOptions as option (option.id)}
                    <button
                        type="button"
                        onclick={() => onToggleStyle(option.id)}
                        aria-pressed={activeStyle === option.id}
                        class={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-badge border px-3 py-1.5 text-[0.875rem] font-medium transition-colors sm:min-h-11 sm:px-3.5 sm:text-[0.925rem] ${
                            activeStyle === option.id
                                ? "border-action-primary bg-action-primary text-text-inverse"
                                : "border-border-default bg-surface-card text-text-default hover:bg-action-secondary"
                        }`}
                    >
                        <span>{option.label}</span>
                        {#if activeStyle !== option.id}
                            <span
                                class="rounded-full bg-current/15 px-1.5 py-0.5 text-[0.625rem] font-semibold leading-none sm:text-[0.6875rem]"
                            >
                                {styleCounts[option.id]}
                            </span>
                        {/if}
                    </button>
                {/each}
            </div>
        </div>
    </div>

    <div class="flex flex-col gap-3 border-t border-border-default pt-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-col gap-1">
            <p class="text-sm font-medium text-text-default">
                {visibleCount} von {totalCount} DJs sichtbar
            </p>
            <p class="text-xs text-text-muted">
                Alle DJs aus der WordPress-API bleiben sichtbar; der Zeitraum sortiert passende DJs nach vorne.
            </p>
        </div>
        <p class="meta-text">
            Zeitraum: {getDateFilterLabel(activeDateFilter)}. Suche
            durchsucht DJ-Namen und nächste Termine.
            {#if activeStyle}
                Aktiver Stil: {getStyleLabel(activeStyle as DjStyleKey | null)}.
            {/if}
        </p>
    </div>
</section>
