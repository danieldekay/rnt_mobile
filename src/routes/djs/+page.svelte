<script lang="ts">
    import { resolve } from "$app/paths";
    import { navigating } from "$app/state";
    import SkeletonCard from "$lib/components/SkeletonCard.svelte";
    import DjCard from "$lib/components/DjCard.svelte";
    import DjFilterBar from "$lib/components/DjFilterBar.svelte";
    import {
        countEntitiesForDateFilters,
    } from "$lib/utils/date-filters";
    import type {
        DjProfileSummary,
        DjStyleKey,
        EntityDateFilter,
    } from "$lib/types";
    import type { PageProps } from "./$types";
    import SeoHead from "$lib/components/SeoHead.svelte";
    import { mapHubPageSeo } from "$lib/seo/pages";

    const seo = mapHubPageSeo("djs");

    type StyleOption = {
        id: DjStyleKey;
        label: string;
    };

    const styleOptions: StyleOption[] = [
        { id: "traditional", label: "Traditionell" },
        { id: "neo", label: "Neo" },
        { id: "fifty-fifty", label: "50/50" },
        { id: "mixed", label: "Gemischt" },
    ];

    let { data }: PageProps = $props();
    let activeStyle = $state<DjStyleKey | null>(null);
    let searchQuery = $state("");
    let activeDateFilter = $state<EntityDateFilter>("current-month");
    const djs = $derived((data.djs as DjProfileSummary[]) ?? []);
    const dateFilteredDjs = $derived(
        djs.toSorted((left, right) => {
            const countDelta =
                right.upcomingCount - left.upcomingCount;
            if (countDelta !== 0) return countDelta;
            return left.name.localeCompare(right.name, "de");
        }),
    );
    const filteredDjs = $derived.by(() => {
        const normalizedQuery = searchQuery.trim().toLocaleLowerCase("de");

        return dateFilteredDjs.filter((dj) => {
            const matchesStyle = !activeStyle || dj.style === activeStyle;
            const matchesSearch =
                normalizedQuery.length === 0 ||
                dj.searchText.includes(normalizedQuery);
            return matchesStyle && matchesSearch;
        });
    });

    const styleCounts = $derived.by(() => {
        const counts: Record<DjStyleKey, number> = {
            traditional: 0,
            neo: 0,
            "fifty-fifty": 0,
            mixed: 0,
        };

        for (const dj of dateFilteredDjs) {
            counts[dj.style] += 1;
        }

        return counts;
    });

    const visibleCount = $derived(filteredDjs.length);
    const totalCount = $derived(dateFilteredDjs.length);
    const dateFilterCounts = $derived.by(() =>
        countEntitiesForDateFilters(djs, (dj) => dj.countsByDateFilter),
    );
    const hasActiveFilters = $derived(
        activeStyle !== null ||
            searchQuery.trim().length > 0 ||
            activeDateFilter !== "current-month",
    );
    const showLoading = $derived(
        Boolean(
            navigating.to &&
                navigating.to.url.pathname === resolve("/djs") &&
                !data.loadError &&
                djs.length === 0,
        ),
    );

    function toggleStyle(style: DjStyleKey | null): void {
        activeStyle = activeStyle === style ? null : style;
    }

    function resetFilters(): void {
        activeDateFilter = "current-month";
        activeStyle = null;
        searchQuery = "";
    }

    function getStyleLabel(style: DjStyleKey | null): string {
        const match = styleOptions.find((option) => option.id === style);
        return match?.label ?? "Gemischt";
    }

    function handleSearchChange(value: string) {
        searchQuery = value;
    }

    function handleToggleStyle(style: string | null) {
        toggleStyle(style as DjStyleKey | null);
    }
</script>

<SeoHead {seo} />

<div class="page-stack">
    <div class="page-stack">
        <section class="space-y-3">
            <p
                class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted"
            >
                Musik in der Region
            </p>
            <h1
                class="font-display text-[2rem] font-semibold text-text-default"
            >
                DJs
            </h1>
            <p class="meta-text">
                RNT hat eine DJ Datenbank, sammelt aber auch automatisch aus
                aktuellen Eventbeschreibungen. Suche nach DJs und springe direkt
                ins Profil oder zum Nächsten Termin.
            </p>
        </section>

        <DjFilterBar
            {searchQuery}
            {activeDateFilter}
            {activeStyle}
            {dateFilterCounts}
            {styleOptions}
            {styleCounts}
            {visibleCount}
            {totalCount}
            {hasActiveFilters}
            onSearchChange={handleSearchChange}
            onResetFilters={resetFilters}
            onToggleStyle={handleToggleStyle}
            getStyleLabel={getStyleLabel}
        />

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
                    DJs konnten nicht geladen werden
                </p>
                <p class="meta-text">Bitte versuche es spaeter erneut.</p>
            </section>
        {:else if filteredDjs.length === 0 && totalCount === 0}
            <section class="card space-y-2 p-6 text-center">
                <p class="text-[1rem] font-semibold text-text-default">
                    Keine DJs in diesem Zeitraum
                </p>
                <p class="meta-text">
                    Wähle einen anderen Zeitraum, um weitere DJs zu sehen.
                </p>
            </section>
        {:else if filteredDjs.length === 0}
            <section class="card space-y-2 p-6 text-center">
                <p class="text-[1rem] font-semibold text-text-default">
                    Keine DJs für diese Auswahl
                </p>
                <p class="meta-text">
                    Passe Suche oder Musikprofil an, um weitere DJs zu sehen.
                </p>
            </section>
        {:else}
            <div class="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {#each filteredDjs as dj (dj.id)}
                    <DjCard
                        {dj}
                        {activeDateFilter}
                    />
                {/each}
            </div>
        {/if}
    </div>
</div>
