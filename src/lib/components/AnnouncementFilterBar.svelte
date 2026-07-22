<script lang="ts">
    let {
        visibleCount,
        totalCount,
        hasArchiveFilter,
        activeArchive,
        archiveBuckets,
        toggleArchive,
    }: {
        visibleCount: number;
        totalCount: number;
        hasArchiveFilter: boolean;
        activeArchive: string | null;
        archiveBuckets: { key: string; label: string; count: number }[];
        toggleArchive: (key: string | null) => void;
    } = $props();
</script>

<section class="card space-y-4 p-4 sm:p-5">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div class="space-y-1">
            <p class="text-sm font-medium text-text-default">
                {visibleCount} von {totalCount} Meldungen sichtbar
            </p>
        </div>
        {#if hasArchiveFilter}
            <p class="meta-text">
                Aktiver Monat: {archiveBuckets.find(
                    (bucket) => bucket.key === activeArchive,
                )?.label}
            </p>
        {/if}
    </div>

    <div class="flex flex-wrap gap-2" aria-label="Ankuendigungsfilter">
        <button
            type="button"
            onclick={() => toggleArchive(null)}
            aria-pressed={activeArchive === null}
            class={`inline-flex min-h-12 items-center gap-2 rounded-badge border px-4 py-2 text-[0.95rem] font-medium transition-colors ${
                activeArchive === null
                    ? "border-action-primary bg-action-primary text-text-inverse"
                    : "border-border-default bg-surface-card text-text-default hover:bg-action-secondary"
            }`}
        >
            <span>Alle Monate</span>
            <span
                class="rounded-full bg-current/15 px-2 py-0.5 text-[0.75rem] font-semibold leading-none"
                >{totalCount}</span
            >
        </button>
        {#each archiveBuckets as bucket (bucket.key)}
            <button
                type="button"
                onclick={() => toggleArchive(bucket.key)}
                aria-pressed={activeArchive === bucket.key}
                class={`inline-flex min-h-12 items-center gap-2 rounded-badge border px-4 py-2 text-[0.95rem] font-medium transition-colors ${
                    activeArchive === bucket.key
                        ? "border-action-primary bg-action-primary text-text-inverse"
                        : "border-border-default bg-surface-card text-text-default hover:bg-action-secondary"
                }`}
            >
                <span>{bucket.label}</span>
                <span
                    class="rounded-full bg-current/15 px-2 py-0.5 text-[0.75rem] font-semibold leading-none"
                    >{bucket.count}</span
                >
            </button>
        {/each}
    </div>
</section>
