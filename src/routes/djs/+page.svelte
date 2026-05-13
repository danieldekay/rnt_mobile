<script lang="ts">
    import { resolve } from "$app/paths";
    import { navigating } from "$app/state";
    import SkeletonCard from "$lib/components/SkeletonCard.svelte";
    import DateFilterChips from "$lib/components/DateFilterChips.svelte";
    import {
        countEntitiesForDateFilters,
        getDateFilterLabel,
    } from "$lib/utils/date-filters";
    import type {
        DjProfileSummary,
        DjStyleKey,
        EntityDateFilter,
        MusicType,
    } from "$lib/types";
    import {
        MUSIC_TYPE_NAMES,
        MUSIC_TYPE_BADGE_CLASSES,
    } from "$lib/constants";
    import type { PageProps } from "./$types";

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
    let showAllWpDjs = $state(false);
    $effect(() => {
        const stored = localStorage.getItem("showAllWpDjs");
        if (stored !== null) {
            showAllWpDjs = stored === "true";
        }
        // watch for changes
        $effect(() => {
            localStorage.setItem("showAllWpDjs", String(showAllWpDjs));
        });
    });

    const djs = $derived((data.djs as DjProfileSummary[]) ?? []);
    const dateFilteredDjs = $derived.by(() =>
        djs
            .filter(
                (dj) =>
                    showAllWpDjs || dj.countsByDateFilter[activeDateFilter] > 0,
            )
            .sort((left, right) => {
                const countDelta =
                    right.countsByDateFilter[activeDateFilter] -
                    left.countsByDateFilter[activeDateFilter];
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
        showAllWpDjs = false;
    }

    function getInitials(name: string): string {
        const words = name
            .split(/\s+/)
            .map((value) => value.trim())
            .filter((value) => value.length > 0);

        if (words.length === 0) return "DJ";
        if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    function getStyleLabel(style: DjStyleKey): string {
        const match = styleOptions.find((option) => option.id === style);
        return match?.label ?? "Gemischt";
    }



    function getAvatarTone(style: DjStyleKey): string {
        switch (style) {
            case "traditional":
                return "border-dj-traditional/25 bg-dj-traditional/15 text-dj-traditional";
            case "neo":
                return "border-dj-neo/20 bg-dj-neo/15 text-dj-neo";
            case "fifty-fifty":
                return "border-dj-fifty-fifty/20 bg-dj-fifty-fifty/15 text-dj-fifty-fifty";
            default:
                return "border-border-default bg-surface-subtle text-text-default";
        }
    }

    function getNextEventMeta(dj: DjProfileSummary): string {
        const nextEvent =
            dj.nextEventsByDateFilter[activeDateFilter] ??
            dj.nextEventsByDateFilter.all;
        if (!nextEvent) return "Kein Termin im Zeitraum";
        return nextEvent.city
            ? `${nextEvent.dateLabel} · ${nextEvent.city}`
            : nextEvent.dateLabel;
    }

    function getUpcomingCount(dj: DjProfileSummary): number {
        return dj.countsByDateFilter[activeDateFilter];
    }

    function getNextEvent(dj: DjProfileSummary) {
        return (
            dj.nextEventsByDateFilter[activeDateFilter] ??
            dj.nextEventsByDateFilter.all ??
            null
        );
    }
</script>

<svelte:head>
    <title>DJs - RNT Kalender</title>
</svelte:head>

{#snippet filterToolbar()}
    <section class="card space-y-4 p-4">
        <div
            class="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_auto] lg:items-end"
        >
            <label class="block min-w-0">
                <span class="mb-1.5 block text-sm font-medium text-text-default"
                    >Suche</span
                >
                <input
                    type="search"
                    bind:value={searchQuery}
                    placeholder="Nach DJ-Name oder Nächstem Termin suchen"
                    class="min-h-12 w-full rounded-control border border-border-default bg-surface-card px-4 py-2 text-[0.95rem] text-text-default outline-none transition-colors placeholder:text-text-muted focus:border-action-primary"
                />
            </label>

            <button
                type="button"
                onclick={resetFilters}
                disabled={!hasActiveFilters}
                class="inline-flex min-h-12 items-center justify-center rounded-control border border-border-default bg-surface-subtle px-4 py-2 text-[0.95rem] font-medium text-text-default transition-colors enabled:hover:bg-action-secondary disabled:cursor-not-allowed disabled:opacity-55"
            >
                Zuruecksetzen
            </button>
        </div>

        <DateFilterChips
            bind:value={activeDateFilter}
            counts={dateFilterCounts}
        />

        <div
            class="flex items-center justify-between gap-2 border-t border-border-default pt-3"
        >
            <div class="flex items-center gap-3">
                <button
                    type="button"
                    onclick={() => (showAllWpDjs = !showAllWpDjs)}
                    aria-pressed={showAllWpDjs}
                    aria-describedby="show-all-djs-help"
                    class="group relative inline-flex min-h-10 items-center gap-2 rounded-badge border px-3 py-2 text-sm font-medium transition-colors hover:bg-action-secondary"
                >
                    <span class="flex items-center gap-2">
                        <svg
                            class={`h-4 w-4 transition-transform ${
                                showAllWpDjs
                                    ? "text-action-primary"
                                    : "text-text-muted"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d={showAllWpDjs
                                    ? "M4 6h16M4 12h16M4 18h16"
                                    : "M4 6h16M4 12h16M4 18h16"}
                            />
                        </svg>
                        <span
                            class={showAllWpDjs
                                ? "text-action-primary"
                                : "text-text-default"}
                        >
                            {showAllWpDjs
                                ? "Alle DJs"
                                : "DJs mit bekannten Terminen"}
                        </span>
                    </span>
                    <span
                        class="rounded-full bg-current/15 px-1.5 py-0.5 text-[0.6875rem] font-semibold leading-none transition-colors"
                    >
                        {showAllWpDjs ? "Aktiv" : "Aus"}
                    </span>
                </button>
                <span id="show-all-djs-help" class="text-xs text-text-muted">
                    Zeigt DJs ohne Termine an
                </span>
            </div>
        </div>

        <div class="flex flex-wrap gap-2">
            <button
                type="button"
                onclick={() => toggleStyle(null)}
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
                    onclick={() => toggleStyle(option.id)}
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

        <div
            class="flex flex-col gap-3 border-t border-border-default pt-3 lg:flex-row lg:items-center lg:justify-between"
        >
            <div class="flex flex-col gap-1">
                <p class="text-sm font-medium text-text-default">
                    {visibleCount} von {totalCount} DJs sichtbar
                </p>
                {#if showAllWpDjs}
                    <p
                        class="text-xs text-text-muted"
                        role="tooltip"
                        aria-label="Zeigt alle DJs aus der WordPress-API an, auch ohne Termine im gewählten Zeitraum"
                    >
                        <span class="inline-flex items-center gap-1">
                            <svg
                                class="h-3 w-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            Zeigt alle WP API DJs an (auch ohne Termine)
                        </span>
                    </p>
                {/if}
            </div>
            <p class="meta-text">
                Zeitraum: {getDateFilterLabel(activeDateFilter)}. Suche
                durchsucht DJ-Namen und Nächste Termine.
                {#if activeStyle}
                    Aktiver Stil: {getStyleLabel(activeStyle)}.
                {/if}
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
                    {@const nextEvent = getNextEvent(dj)}
                    <article
                        class="card flex h-full flex-col gap-4 p-5 transition-all duration-200 hover:shadow-lg"
                    >
                        <div class="flex items-start gap-4">
                            <div class="relative">
                                {#if dj.image}
                                    <div
                                        class="relative aspect-square h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-border-default shadow-sm"
                                    >
                                        <img
                                            src={dj.image}
                                            alt={dj.name}
                                            class="absolute inset-0 h-full w-full object-cover"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                {:else}
                                    <div
                                        class={`aspect-square h-14 w-14 shrink-0 flex items-center justify-center rounded-full border-2 text-lg font-bold ${getAvatarTone(
                                            dj.style,
                                        )} shadow-sm`}
                                    >
                                        {getInitials(dj.name)}
                                    </div>
                                {/if}

                                <span
                                    class="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/80 bg-surface-default text-[0.625rem] font-medium ${MUSIC_TYPE_BADGE_CLASSES[
                                        dj.style as MusicType
                                    ]} shadow-sm"
                                >
                                    {MUSIC_TYPE_NAMES[dj.style as MusicType].charAt(0)}
                                </span>
                            </div>

                            <div class="flex-1 min-w-0">
                                <h2
                                    class="text-lg font-bold leading-tight text-text-default truncate"
                                >
                                    <a
                                        href={resolve(`/djs/${dj.slug}`)}
                                        data-sveltekit-preload-data="hover"
                                        class="transition-colors hover:text-action-primary"
                                    >
                                        {dj.name}
                                    </a>
                                </h2>
                            </div>
                        </div>

                        {#if nextEvent}
                            <div
                                class="space-y-2.5 pt-1 border-t border-border-default/50"
                            >
                                <a
                                    href={nextEvent.internalPath
                                        ? resolve(nextEvent.internalPath)
                                        : nextEvent.externalUrl}
                                    data-sveltekit-preload-data="hover"
                                    target={nextEvent.externalUrl
                                        ? "_blank"
                                        : undefined}
                                    rel={nextEvent.externalUrl
                                        ? "noopener noreferrer"
                                        : undefined}
                                    class="block hover:opacity-90 transition-opacity"
                                >
                                    <div class="flex items-start gap-2">
                                        <svg
                                            class="h-4 w-4 text-action-primary flex-shrink-0 mt-0.5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                fill-rule="evenodd"
                                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                                clip-rule="evenodd"
                                            />
                                        </svg>
                                        <div class="flex-1 min-w-0">
                                            <p
                                                class="text-sm font-medium leading-snug text-text-default line-clamp-2"
                                            >
                                                {nextEvent.title}
                                            </p>
                                            <p
                                                class="text-xs text-text-muted mt-0.5"
                                            >
                                                {getNextEventMeta(dj)}
                                            </p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        {:else if showAllWpDjs && getUpcomingCount(dj) <= 0}
                            <div
                                class="space-y-2.5 pt-1 border-t border-amber-200/30"
                            >
                                <div class="flex items-start gap-2">
                                    <svg
                                        class="h-4 w-4 text-amber-600/80 flex-shrink-0 mt-0.5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                    <div class="flex-1 min-w-0">
                                        <p
                                            class="text-sm text-amber-800/80 line-clamp-2"
                                        >
                                            Keine Termine im gewählten Zeitraum
                                        </p>
                                        <p
                                            class="text-xs text-amber-700/60 mt-0.5"
                                        >
                                            DJs ohne aktuelle Events werden nur
                                            angezeigt, wenn "Alle DJs" aktiviert
                                            ist
                                        </p>
                                    </div>
                                </div>
                            </div>
                        {/if}

                        <div class="mt-auto flex gap-2 pt-3">
                            <a
                                href={resolve(`/djs/${dj.slug}`)}
                                data-sveltekit-preload-data="hover"
                                class="min-h-4 px-4 py-2 text-sm font-medium text-text-default bg-white border border-border-default hover:bg-surface-subtle hover:shadow-md transition-all duration-200 rounded-badge flex-1 min-w-[60px] justify-center"
                                >DJ-Profil ansehen</a
                            >
                        </div>
                    </article>
                {/each}
            </div>
        {/if}
    </div>
</div>
