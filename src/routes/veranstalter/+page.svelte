<script lang="ts">
    import { resolve } from "$app/paths";
    import { navigating } from "$app/state";
    import SkeletonCard from "$lib/components/SkeletonCard.svelte";
    import DateFilterChips from "$lib/components/DateFilterChips.svelte";
    import OrganizerCard from "$lib/components/OrganizerCard.svelte";
    import {
        countEntitiesForDateFilters,
        getDateFilterLabel,
        type EntityDateFilter,
    } from "$lib/utils/date-filters";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
    let activeCity = $state("");
    let searchQuery = $state("");
    let activeDateFilter = $state<EntityDateFilter>("current-month");

    const organizers = $derived(data.organizers);
    const dateFilteredOrganizers = $derived.by(() =>
        organizers
            .filter(
                (organizer) =>
                    organizer.countsByDateFilter[activeDateFilter] > 0,
            )
            .sort((left, right) => {
                const countDelta =
                    right.countsByDateFilter[activeDateFilter] -
                    left.countsByDateFilter[activeDateFilter];
                if (countDelta !== 0) return countDelta;
                return left.organizer.localeCompare(right.organizer, "de");
            }),
    );

    const cityOptions = $derived.by(() => {
        const counts: Record<string, number> = {};

        for (const organizer of dateFilteredOrganizers) {
            if (organizer.cityLabel === "Unbekannt") continue;
            counts[organizer.cityLabel] =
                (counts[organizer.cityLabel] ?? 0) + 1;
        }

        return Object.entries(counts)
            .sort(([left], [right]) => left.localeCompare(right, "de"))
            .map(([city, count]) => ({ city, count }));
    });

    const filteredOrganizers = $derived.by(() => {
        const normalizedQuery = searchQuery.trim().toLocaleLowerCase("de");

        return dateFilteredOrganizers.filter((organizer) => {
            const matchesCity =
                activeCity.length === 0 || organizer.cityLabel === activeCity;
            const matchesSearch =
                normalizedQuery.length === 0 ||
                organizer.organizer
                    .toLocaleLowerCase("de")
                    .includes(normalizedQuery) ||
                organizer.cityLabel
                    .toLocaleLowerCase("de")
                    .includes(normalizedQuery) ||
                organizer.website
                    .toLocaleLowerCase("de")
                    .includes(normalizedQuery);

            return matchesCity && matchesSearch;
        });
    });

    const visibleCount = $derived(filteredOrganizers.length);
    const totalCount = $derived(dateFilteredOrganizers.length);
    const dateFilterCounts = $derived.by(() =>
        countEntitiesForDateFilters(
            organizers,
            (organizer) => organizer.countsByDateFilter,
        ),
    );
    const hasActiveFilters = $derived(
        activeCity.length > 0 ||
            searchQuery.trim().length > 0 ||
            activeDateFilter !== "current-month",
    );
    const showLoading = $derived(
        Boolean(
            navigating.to &&
                navigating.to.url.pathname === resolve("/veranstalter") &&
                !data.loadError &&
                organizers.length === 0,
        ),
    );

    function resetFilters(): void {
        activeDateFilter = "current-month";
        activeCity = "";
        searchQuery = "";
    }

    function formatUpcomingBadge(upcomingCount: number): string {
        if (upcomingCount <= 0) return "Keine Termine";
        if (upcomingCount === 1) return "1 Termin";
        return `${upcomingCount} Termine`;
    }
</script>

<svelte:head>
    <title>Veranstalter - RNT Kalender</title>
</svelte:head>

{#snippet filterToolbar()}
    <section class="card space-y-4 p-4">
        <div
            class="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(14rem,0.9fr)_auto] lg:items-end"
        >
            <label class="block min-w-0">
                <span class="mb-1.5 block text-sm font-medium text-text-default"
                    >Suche</span
                >
                <input
                    type="search"
                    bind:value={searchQuery}
                    placeholder="Nach Veranstalter, Stadt oder Website suchen"
                    class="min-h-12 w-full rounded-control border border-border-default bg-surface-card px-4 py-2 text-[0.95rem] text-text-default outline-none transition-colors placeholder:text-text-muted focus:border-action-primary"
                />
            </label>

            <label class="block min-w-0">
                <span class="mb-1.5 block text-sm font-medium text-text-default"
                    >Stadt</span
                >
                <select
                    bind:value={activeCity}
                    class="min-h-12 w-full rounded-control border border-border-default bg-surface-card px-4 py-2 text-[0.95rem] text-text-default outline-none transition-colors focus:border-action-primary"
                >
                    <option value="">Alle Städte</option>
                    {#each cityOptions as option (option.city)}
                        <option value={option.city}
                            >{option.city} ({option.count})</option
                        >
                    {/each}
                </select>
            </label>

            <button
                type="button"
                onclick={resetFilters}
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

        <div
            class="flex flex-col gap-1 border-t border-border-default pt-3 lg:flex-row lg:items-center lg:justify-between"
        >
            <p class="text-sm font-medium text-text-default">
                {visibleCount} von {totalCount} Veranstaltern
            </p>
        </div>
    </section>
{/snippet}

<div class="space-y-4">
    <div class="space-y-4">
        <section class="space-y-3">
            <p
                class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted"
            >
                Community in der Region
            </p>
            <h1
                class="font-display text-[2rem] font-semibold text-text-default"
            >
                Veranstalter
            </h1>
            <p class="meta-text max-w-[58ch]">
                Verzeichnis der aktiven Tango-Veranstalter mit Website,
                regionalem Schwerpunkt und direktem Zugang zu ihren kommenden
                Terminen.
            </p>
        </section>

        {@render filterToolbar()}

        {#if showLoading}
            <div
                class="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4"
                role="status"
                aria-live="polite"
            >
                {#each Array.from({ length: 6 }) as _, index (index)}
                    <SkeletonCard
                        variant="avatar-list"
                        imageShape="circle"
                        imageSize="avatar"
                        lines={1}
                    />
                {/each}
            </div>
        {:else if data.loadError}
            <section class="card space-y-2 p-6 text-center" role="alert">
                <p class="text-[1rem] font-semibold text-text-default">
                    Veranstalter konnten nicht geladen werden
                </p>
                <p class="meta-text">Bitte versuche es spaeter erneut.</p>
            </section>
        {:else if filteredOrganizers.length === 0 && totalCount === 0}
            <section class="card space-y-2 p-6 text-center">
                <p class="text-[1rem] font-semibold text-text-default">
                    Keine Veranstalter in diesem Zeitraum
                </p>
                <p class="meta-text">
                    Wähle einen anderen Zeitraum, um weitere Veranstalter zu
                    sehen.
                </p>
            </section>
        {:else if filteredOrganizers.length === 0}
            <section class="card space-y-2 p-6 text-center">
                <p class="text-[1rem] font-semibold text-text-default">
                    Keine Veranstalter für diesen Filter
                </p>
                <p class="meta-text">
                    Passe Suche oder Stadtfilter an, um weitere Veranstalter zu
                    sehen.
                </p>
            </section>
        {:else}
            <div class="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {#each filteredOrganizers as organizer (organizer.id)}
                    {@const enhancedOrganizer = {
                        ...organizer,
                        image: typeof organizer.image === "string" ? organizer.image : (false as const),
                        description: organizer.description || "",
                        website: organizer.website || organizer.url || "",
                        slug: organizer.slug || "",
                        verification: {}
                    }}
                    <OrganizerCard
                        organizer={enhancedOrganizer}
                        nextEvents={organizer.nextEvents || []}
                        showVerification={false}
                        showSocialLinks={false}
                        showContactInfo={false}
                        showStatistics={false}
                    />
                {/each}
            </div>
        {/if}
    </div>
</div>