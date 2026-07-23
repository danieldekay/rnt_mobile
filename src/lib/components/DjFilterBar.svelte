<script lang="ts">
    import DateFilterChips from "$lib/components/DateFilterChips.svelte";
    import { getDateFilterLabel } from "$lib/utils/date-filters";
    import type { EntityDateFilter, DjStyleKey } from "$lib/types";

    let {
        searchQuery,
        activeDateFilter,
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

<section class="card space-y-4 p-4">
    <div class="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_auto] lg:items-end">
        <label class="block min-w-0">
            <span class="mb-1.5 block text-sm font-medium text-text-default"
                >Suche</span
            >
            <input
                type="search"
                value={searchQuery}
                oninput={handleSearchInput}
                placeholder="Nach DJ-Name oder Nächstem Termin suchen"
                class="min-h-12 w-full field-input"
            />
        </label>

        <button
            type="button"
            onclick={onResetFilters}
            disabled={!hasActiveFilters}
            class="inline-flex min-h-12 items-center justify-center rounded-control border border-border-default bg-surface-subtle px-4 py-2 text-[0.95rem] font-medium text-text-default transition-colors enabled:hover:bg-action-secondary disabled:cursor-not-allowed disabled:opacity-55"
        >
            Zurücksetzen
        </button>
    </div>

    <DateFilterChips
        bind:value={activeDateFilter}
        counts={dateFilterCounts}
    />

    <div class="flex flex-wrap gap-2">
        <button
            type="button"
            onclick={() => onToggleStyle(null)}
            aria-pressed={activeStyle === null}
            class={`inline-flex min-h-12 items-center rounded-badge border px-4 py-2 text-[0.95rem] font-medium transition-colors ${
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
                class={`inline-flex min-h-12 items-center gap-2 rounded-badge border px-4 py-2 text-[0.95rem] font-medium transition-colors ${
                    activeStyle === option.id
                        ? "border-action-primary bg-action-primary text-text-inverse"
                        : "border-border-default bg-surface-card text-text-default hover:bg-action-secondary"
                }`}
            >
                <span>{option.label}</span>
                {#if activeStyle !== option.id}
                    <span
                        class="rounded-full bg-current/15 px-1.5 py-0.5 text-[0.6875rem] font-semibold leading-none"
                    >
                        {styleCounts[option.id]}
                    </span>
                {/if}
            </button>
        {/each}
    </div>

    <div class="flex flex-col gap-3 border-t border-border-default pt-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-col gap-1">
            <p class="text-sm font-medium text-text-default">
                {visibleCount} von {totalCount} DJs sichtbar
            </p>
            <p class="text-xs text-text-muted">
                <span class="inline-flex items-center gap-1">
                    <svg
                        class="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    Alle DJs aus der WordPress-API werden angezeigt
                </span>
            </p>
        </div>
        <p class="meta-text">
            Zeitraum: {getDateFilterLabel(activeDateFilter)}. Suche
            durchsucht DJ-Namen und Nächste Termine.
            {#if activeStyle}
                Aktiver Stil: {getStyleLabel(activeStyle as DjStyleKey | null)}.
            {/if}
        </p>
    </div>
</section>
